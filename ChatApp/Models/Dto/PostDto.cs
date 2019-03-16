﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ChatApp.Models.Dto
{
    public class PostDto
    {

        public string NameOfUser { get; set; }
        public string Myavatar { get; set; }
        public string avatar { get; set; }
        public string PostText { get; set; }
        public string GroupName { get; set; }
        public string TimePost { get; set; }
        public int LikeNumber { get; set; }
        public int PostId { get; set; }
        public List<CommentDto> listComment;

    }
}