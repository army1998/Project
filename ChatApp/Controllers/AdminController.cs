﻿using ChatApp.Extensions;
using ChatApp.Models.Dto;
using ChatApp.Models.Entities;
using ChatApp.Models.ViewModels;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Mvc;

namespace ChatApp.Controllers
{
    public class AdminController : Controller
    {
		ChatDbcontext db = new ChatDbcontext();
		// GET: Admin
		public ActionResult Index()
        {
			var userName = Session["username"] as string;
			var user = db.Admins.FirstOrDefault(ad => ad.Username.Equals(userName));
			return View();
        }

		[HttpGet]
		public ActionResult Login()
		{
			var admin = Session["Admin"];
			if(admin != null)
			{
				return RedirectToAction("Index");
			}
			return View();
		}

		[HttpPost]
		public ActionResult Login(FormCollection form)
		{
			string username = form["username"].ToString().Trim();
			string password = form["password"].ToString().Trim();
			string hashedPassword = HashPassword.ComputeSha256Hash(password);

			Admin admin = db.Admins.FirstOrDefault(x => x.Username.Equals("admin") && x.Password.Equals("91b4d142823f7d20c5f08df69122de43f35f057a988d9619f6d3138485c9a203"));
			// Kiểm tra xem user có tồn tại không
			if (admin != null)
			{
				Session["username"] = admin.Username;
				return RedirectToAction("Index");
			}
			ViewBag.ThongBao = "Tên đăng nhập hoặc mật khẩu không chính xác";
			return View();
		}

		// Đăng xuất tài khoản người dùng
		public ActionResult Logout()
		{
			// Hủy session lưu user và tên
			Session.Remove("username");
			// Chuyển hướng đến trang login
			return RedirectToAction("Login");
		}

		[HttpGet]
		public ActionResult GetMembers ()
		{
			var listMembers = db.Users.ToList();
			var listMemberVMs = AutoMapper.Mapper.Map<IEnumerable<UserViewModel>>(listMembers);
			return View(listMemberVMs);
		}

		[HttpGet]
		public ActionResult GetMemberDetail(int? id)
		{
			if (id == null)
			{
				return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
			}
			var member = db.Users.FirstOrDefault(x => x.Id == id);
			if (member == null)
			{
				return HttpNotFound();
			}
			var memberVM = AutoMapper.Mapper.Map<UserViewModel>(member);
			return View(memberVM);
		}

		[HttpGet]
		public ActionResult GetListFriend(int? id)
		{
			if(id == null)
			{
				return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
			}
			var member = db.Users.Find(id);
			if(member == null)
			{
				return HttpNotFound();
			}
			List<FriendInfoViewModel> listFriends = db.Users.FirstOrDefault(x => x.Id == id).ListFriends.
				First().MemberOfListFriends.Where(x => x.AccessRequest).OrderByDescending(s => s.TimeLastChat)
				.Select(s => new FriendInfoViewModel { Id = s.User.Id, UserName = s.User.UserName, Name = s.User.Name, Email = s.User.Email, Avatar = s.User.Avatar })
				.ToList();
			ViewBag.Name = member.Name;
			return View(listFriends);
		}

		[HttpGet]
		public ActionResult GetPostsByUser(int? id)
		{
			if(id == null)
			{
				return new HttpStatusCodeResult(HttpStatusCode.BadRequest);
			}
			User user = db.Users.Find(id);
			if(user == null)
			{
				return HttpNotFound();
			}
			var listPosts = db.Posts.Where(x => x.User.Id == id).ToList();
			var listPostVms = AutoMapper.Mapper.Map<IEnumerable<PostViewModel>>(listPosts);
			ViewBag.Name = user.Name;
			return View(listPostVms);
		}


	}
}