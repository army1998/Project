﻿var hub = $.connection.chatHub;
var QuantityMessage = -1;
var QuantityMessageNew = 0;
var checkOpenBoxMess = false;
var ListFriend;
var ListOnline = [];

$(function () {

    loadListFriend();

    hub.client.setStatus = function (LstAllConnections) {
        ListOnline = [];
        $(".status").html("<i class='fa fa-circle offline'></i> offline");
        for (var key in LstAllConnections) {
            ListOnline.push(LstAllConnections[key]);
            $("[id=" + LstAllConnections[key] + "]").html("<i class='fa fa-circle online'></i> online");
        }
    };

    hub.client.changeStatusSendRequest = function (suggestUser, check) {
        if (check) {
            $("[id=" + suggestUser + "]").parent().find(".add-friend").text("Đã gửi lời mời");
            $("[id=" + suggestUser + "]").parent().find(".add-friend").css("background", "#ef30c8");
        } else {
            $("[id=" + suggestUser + "]").parent().find(".add-friend").text("Kết bạn");
            $("[id=" + suggestUser + "]").parent().find(".add-friend").css("background", "#428bca");
        }
    };

    hub.client.setUserSeen = function (UserName, PartnerUser, checkseen) {
        var PartnerUserName = $("#partnerUserName").val();
        if (MyUserName === UserName) {
            $("[id=" + PartnerUser + "]").parent().next().html("");
            if (checkseen === true && $("#ContentMessage li:last-child").hasClass("MyMessage") && PartnerUserName === PartnerUser) {
                seenMessage();
            }
        }
        if ($("#ContentMessage li:last-child").hasClass("MyMessage") && PartnerUserName === UserName) {
            seenMessage();
        }
    };

    hub.client.setNotSeenMessage = function (MyUserName) {
        $("[id=" + MyUserName + "]").parent().next().html('<i class="fa fa-comment-o"></i>');
        var partner = $("[id=" + MyUserName + "]").parent().parent().clone(true);
        $("[id=" + MyUserName + "]").parent().parent().remove();
        $("ul.list").prepend(partner);
    };

    hub.client.appendSeen = function (MyUserName) {
        var PartnerUserName = $("#partnerUserName").val();
        if (PartnerUserName === MyUserName) {
            seenMessage();
        }
    };

    hub.client.showChatBox = function (Name, myUserName, partnerUserName, message, currentTime) {
        var PartnerUserName = $("#partnerUserName").val();
        QuantityMessageNew++;
        if (PartnerUserName === myUserName) {
            var item1 = '<li class="partnerMessage"><div class="message-data"><span class="message-data-name"><i class="fa fa-circle online"></i> ';
            var item2 = '</span><span class="message-data-time">';
            var item3 = '</span></div><div class="message my-message">';
            var item4 = '</div> </li>';
            var itemAdd = item1 + Name + item2 + currentTime + item3 + message + item4;
            $(".chat-history ul").append(itemAdd);
            hub.server.saveSeenMessage(PartnerUserName, MyUserName);
            hub.server.appendSeenForChatBox(MyUserName, PartnerUserName);
            setTimeout(function () {
                $(".chat-history ul .fa-eye").remove();
                $(".chat-history").scrollTop(7000);
            }, 200);
        } else if (MyUserName === myUserName && partnerUserName === PartnerUserName) {
            item1 = '<li class="clearfix MyMessage"><div class="message-data align-right"><span class="message-data-time">';
            item2 = '</span> &nbsp; &nbsp;<span class="message-data-name">';
            item3 = '</span> <i class="fa fa-circle me"></i></div><div class="message other-message float-right">';
            item4 = '</div> </li>';
            itemAdd = item1 + currentTime + item2 + Name + item3 + message + item4;
            $(".chat-history ul").append(itemAdd);
            setTimeout(function () {
                $(".chat-history ul .fa-eye").remove();
                $(".chat-history").scrollTop(7000);
            }, 200);
        }
    };

    hub.connection.start().done(function () {
        hub.server.setConnectionUser(MyUserName);
        $("#message-to-send").keypress(function (e) {
            if (e.which === 13) {
                var PartnerUserName = $("#partnerUserName").val();
                var message = $(this).val();
                $(this).val('');
                var currentTime = GetDateNow();
                hub.server.send(PartnerUserName, MyUserName, currentTime, message);
                $(".chat-history ul .fa-eye").remove();
            }
        });
        $("#SendClick").click(function () {
            $(".list-icon").hide();
            checkOpenIcon = true;
            if ($("#message-to-send").val().trim() !== "") {
                var PartnerUserName = $("#partnerUserName").val();
                var currentTime = GetDateNow();
                var message = $("#message-to-send").val();
                $("#message-to-send").val("");
                hub.server.send(PartnerUserName, MyUserName, currentTime, message);
                $(".chat-history ul .fa-eye").remove();
            }
        });
    });

    IdCheck = parseInt($(".MyId").attr("id"));
    if (!isNaN(IdCheck)) {
        load();
        GetListPostSave();
    }

    $(".people-list input").keyup(function () {
        keySearch = $(this).val().trim().toLowerCase();
        array2 = [];
        for (var i = 0; i < ListFriend.length; i++) {
            if (ListFriend[i].Name.toLowerCase().includes(keySearch)) {
                array2.push(ListFriend[i]);
            }
        }
        RenderListFriend(array2);
        SetStatusOnline(ListOnline);
    });
});

function GetListPostSave() {
    Id = parseInt($(".MyId").attr("id"));
    url = "/Home/GetListPostSave?id=" + Id;
    $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (array) {
            for (var i = 0; i < array.length; i++) {
                $(".post-saved-clone img").attr("src", array[i].Avatar);
                $(".post-saved-clone .name-postStore").text(array[i].NameUser);
                $(".post-saved-clone .group-joined").text(array[i].SubjectName);
                $(".post-saved-clone .info-userpost p").text(array[i].TimePost);
                $(".post-saved-clone .contentPostStored p").html(array[i].TextContent);
                $(".post-saved-clone .info-userpost a").attr('href', array[i].UrlPost);
                $(".post-saved-clone .post-store").attr('id', array[i].IdPostSave);
                $(".post-saved-clone .img-postsave").attr('src', array[i].Photo);
                itemClone = $(".post-saved-clone").html();
                $(".content-store").prepend(itemClone);
                $(".post-saved-clone .img-postsave").attr('src',"");
            }
            $(".post-saved-clone .post-store").attr('id', 0);
        },
        error: function (message) {
            alert(message.responseText);
        }

    });
}

function SetStatusOnline(array) {
    $(".status").html("<i class='fa fa-circle offline'></i> offline");
    for (var i = 0; i < array.length; i++) {
        $("[id=" + array[i] + "]").html("<i class='fa fa-circle online'></i> online");
    }
}

function OpenChatBox(item) {
    $(".list-icon").hide();
    checkOpenIcon = true;
    if (!checkOpenBoxMess) {
        QuantityMessage = 0;
        checkOpenBoxMess = true;
    } else {
        QuantityMessage = -1;
    }
    var partnerUserName = $(item).find(".status").attr('id');
    var partnerName = $(item).find(".name1").text();
    var partnerImage = $(item).find("img").attr('src');
    QuantityMessageNew = 0;
    $(item).find(".message").html("");
    UserDto = {
        MyUserName: MyUserName,
        PartnerUserName: partnerUserName,
        QuantityMessage: 0,
        QuantityMessageNew: 0
    };
    $(".chat").css('display', '');
    $(".chat #partnerUserName").val(partnerUserName);
    $(".chat .chat-with").text(partnerName);
    $(".chat img").attr('src', partnerImage);
    GetMessages(UserDto);
    setTimeout(function () {
        hub.server.saveSeenMessage(partnerUserName, MyUserName);
    }, 250);
}

function GetMessages(UserDto) {
    $(".chat-history ul").html("");
    $.ajax({
        type: "POST",
        url: '/Home/GetMessage',
        data: JSON.stringify(UserDto),
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (data) {
            for (var i = 0; i < data.length; i++) {
                if (data[i].UserName === UserDto.MyUserName) {
                    var item1 = '<li class="clearfix MyMessage"><div class="message-data align-right"><span class="message-data-time">';
                    var item2 = '</span> &nbsp; &nbsp;<span class="message-data-name">';
                    var item3 = '</span> <i class="fa fa-circle me"></i></div><div class="message other-message float-right">';
                    var item4 = '</div> </li>';
                    var itemAdd = item1 + data[i].TimeSend + item2 + data[i].Name + item3 + data[i].MessageSend + item4;
                    $(".chat-history ul").append(itemAdd);
                } else {
                    item1 = '<li class="partnerMessage"><div class="message-data"><span class="message-data-name"><i class="fa fa-circle online"></i> ';
                    item2 = '</span><span class="message-data-time">';
                    item3 = '</span></div><div class="message my-message">';
                    item4 = '</div> </li>';
                    itemAdd = item1 + data[i].Name + item2 + data[i].TimeSend + item3 + data[i].MessageSend + item4;
                    $(".chat-history ul").append(itemAdd);
                }
            }
        }
    });
    setTimeout(function () {
        $(".chat-history").scrollTop(7000);
    }, 200);
}

function GetDateNow() {
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1;
    var yyyy = today.getFullYear();
    var h = today.getHours();
    var M = today.getMinutes();
    if (dd < 10) {
        dd = '0' + dd;
    }
    if (mm < 10) {
        mm = '0' + mm;
    }
    today = h + 'h' + M + ' - ' + dd + '/' + mm + '/' + yyyy;
    return today;
}

$(".fa.fa-close").click(function () {
    QuantityMessageNew = -1;
    QuantityMessage = 0;
    $("#partnerUserName").val("");
    $(".chat").hide();
});

function seenMessage() {
    setTimeout(function () {
        $(".chat-history ul .fa-eye").remove();
        $(".chat-history ul").append('<i class="fa fa-eye">&nbsp;&nbsp;Đã xem</i>');
    }, 500);
}

function LoadData(item) {
    if ($(item).scrollTop() === 0) {
        QuantityMessage = QuantityMessage + 1;
        if (QuantityMessage !== 0) {
            var partnerUserName = $(".chat #partnerUserName").val();
            UserDto = {
                MyUserName: MyUserName,
                PartnerUserName: partnerUserName,
                QuantityMessage: QuantityMessage,
                QuantityMessageNew: QuantityMessageNew
            };
            $.ajax({
                type: "POST",
                url: '/Home/GetMessage',
                data: JSON.stringify(UserDto),
                contentType: "application/json;charset=utf-8",
                dataType: "json",
                success: function (data) {
                    if (data.length > 0) {
                        for (var i = data.length - 1; i >= 0; i--) {
                            if (data[i].UserName === UserDto.MyUserName) {
                                var item1 = '<li class="clearfix MyMessage"><div class="message-data align-right"><span class="message-data-time">';
                                var item2 = '</span> &nbsp; &nbsp;<span class="message-data-name">';
                                var item3 = '</span> <i class="fa fa-circle me"></i></div><div class="message other-message float-right">';
                                var item4 = '</div> </li>';
                                var itemAdd = item1 + data[i].TimeSend + item2 + data[i].Name + item3 + data[i].MessageSend + item4;
                                $(".chat-history ul").prepend(itemAdd);
                            } else {
                                item1 = '<li class="partnerMessage"><div class="message-data"><span class="message-data-name"><i class="fa fa-circle online"></i> ';
                                item2 = '</span><span class="message-data-time">';
                                item3 = '</span></div><div class="message my-message">';
                                item4 = '</div> </li>';
                                itemAdd = item1 + data[i].Name + item2 + data[i].TimeSend + item3 + data[i].MessageSend + item4;
                                $(".chat-history ul").prepend(itemAdd);
                            }
                        }
                        setTimeout(function () {
                            $(".chat-history").scrollTop(900);
                        }, 200);
                    }
                }
            });
        }
    }
}



var checkOpenIcon = true;
$(".chat-message .icon").click(function () {
    $("#message-to-send").val($("#message-to-send").val() + $(this).text());
});
$(".fa-smile-o").click(function () {
    if (checkOpenIcon) {
        $(".list-icon").show();
        checkOpenIcon = false;
    } else {
        $(".list-icon").hide();
        checkOpenIcon = true;
    }
});

$("#message-to-send").focus(function () {
    $(".list-icon").hide();
    checkOpenIcon = true;
});

$(".delete-suggest").click(function () {
    $(this).parents(".suggest-friend").slideUp(300);
});

$(".add-friend").click(function () {
    var suggestUser = $(this).next().val();
    if ($(this).text().trim() === "Kết bạn") {
        hub.server.sendRequest(suggestUser, MyUserName, true);
    } else {
        hub.server.sendRequest(suggestUser, MyUserName, false);
    }
});
function load() {
    Id = parseInt($(".MyId").attr("id"));
    url = "/Home/Edit?id=" + Id;
    $.ajax({
        type: "POST",
        url: url,
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
            text = "Đang cập nhật";
            if (result.PhoneNumber === null) {
                result.PhoneNumber=text;
            }
            if (result.SchoolName === null) {
                result.SchoolName = text;
            }
            if (result.Address === null) {
                result.Address = text;
            }
            var html = '';
            var date = result.DoB;
            var ress = new Date(parseInt(date.replace("/Date(", "").replace(")/")));
            var dateTime = ress.getDate() + "-" + (ress.getMonth() + 1) + "-" + ress.getFullYear();
            html += '<ul>';
            html += '<li>' + '<span class="ht-left">Họ tên</span>' + '<span class="ht-right">' + result.Name + '</span>' + '</li>';
            html += '<li>' + '<span class="ht-left">Trường</span>' + '<span class="ht-right">' + result.SchoolName + '</span>' + '</li>';
            html += '<li>' + '<span class="ht-left">Ngày sinh</span>' + '<span class="ht-right">' + dateTime + '</span>' + '</li>';
            html += '<li>' + '<span class="ht-left">Địa chỉ</span>' + '<span class="ht-right">' + result.Address + '</span>' + '</li>';
            html += '<li>' + '<span class="ht-left">Số điện thoại</span>' + '<span class="ht-right">' + result.PhoneNumber + '</span>' + '</li>';
            html += '</ul>';
            $('.info-user').html(html);
        },
        error: function (message) {
            alert(message.responseText);
        }

    });
}

function loadListFriend() {
    $.ajax({
        type: "GET",
        url: "/Home/GetListFriend?id=0",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (array) {
            ListFriend = array;
            RenderListFriend(array);
        },
        error: function (message) {
            alert(message.responseText);
        }
    });
}

function RenderListFriend(array) {
    $(".people-list .list").html("");
    iconSeenMessage = $('<i class="fa fa-comment-o"></i>');
    for (var i = 0; i < array.length; i++) {
        $(".item-friend-clone img").attr("src", array[i].Avatar);
        $(".item-friend-clone .name1").text(array[i].Name);
        $(".item-friend-clone .status").attr("id", array[i].UserName);
        if (!array[i].SeenMessage) {
            $(".item-friend-clone .message").html(iconSeenMessage);
        } else {
            $(".item-friend-clone .message").html("");
        }
        itemClone = $(".item-friend-clone ul").html();
        $(".people-list .list").append(itemClone);
    }
    $(".item-friend-clone img").attr("src", "");
    $(".item-friend-clone .name1").text("");
    $(".item-friend-clone .status").attr("id", "");
    $(".item-friend-clone .message").html("");
}

$("#UpdateUser").on("click", function () {
    check = false;
    var object = {
        Name: $('#Name').val(),
        SchoolName: $('#SchoolName').val(),
        DoB: $('#DoB').val(),
        Address: $('#Address').val(),
        PhoneNumber: $('#PhoneNumber').val().trim()
    };
    if (object.PhoneNumber !== '') {
        res = ValidatePhone(object.PhoneNumber);
        if (!res) {
            $("#PhoneNumber").focus();
            return false;
        }
    }
    else {
        object.PhoneNumber = "Đang cập nhật";
    }
       
    Id = parseInt($(".MyId").attr("id"));

                url = "/Home/SaveData?id=" + Id;
                $.ajax({
                    type: "POST",
                    url: url,
                    data: JSON.stringify(object),
                    contentType: "application/json;charset=utf-8",
                    dataType: "json",
                    success: function (result) {
                        load();
                        $(".edit-user").hide();
                        $(".info-user").show();
                        count++;
                    },
                    error: function (errormessage) {
                        alert(errormessage.responseText);
                    }
                });
});

function UploadAvatar(formData) {
    url = "";
    if (checkAvarta === 1) {
        url = "/Home/UploadAvatar?id=1";
    } else if (checkAvarta === 2) {
        url = "/Home/UploadAvatar?id=2";
    }
   
    var ajaxConfig = {
        type: "POST",
        url: url,
        data: new FormData(formData),
        success: function (result) {
            $(".avatar .img-responsive img").attr("src", result.Avatar);
            $(".background img").attr("src", result.CoverPhoto);

            $("#upImg").hide();
            $(".modal-backdrop").remove();
            $("#myModal #close").click();
            Swal.fire(
                'Thành công!',
                'Bạn đã thay đổi ảnh thành công!',
                'success'
            );
        }
    }
    if ($(formData).attr('enctype') === "multipart/form-data") {
        ajaxConfig["contentType"] = false;
        ajaxConfig["processData"] = false;
    }
    $.ajax(ajaxConfig);

    return false;
}
function ValidatePhone(phone) {
    regex = new RegExp("^[0-9]{10,11}$");
    res = regex.test(phone);
    if (!res) {
        $("#PhoneNumber").css("border-color", "red");
    }
    else {
        $("#PhoneNumber").css('border-color', 'lightgrey');
    }
    return res;
}

$("#have-seen").click(function () {
    $("#notifi a").addClass("notifi-seen");
    $(".icon-notify .badge").text(0).hide();
    $.ajax({
        type: "POST",
        url: "/Notifi/SaveSeenAllNotifi",
        contentType: "application/json;charset=utf-8",
        dataType: "json",
        success: function (result) {
           
        },
        error: function (message) {
            alert(message.responseText);
        }

    });
});
$("#ChangePass").click(function () {
    $(".ChangePass").toggle(150);
    $("#Password").val('');
    $("#NewPassword").val('');
    $("#ConfirmPassword").val('');
});
$("#Cancel").click(function () {
    $(".ChangePass").hide(150);
    $("#prePassword").hide();
    $('#Password').css("border-color", "#ccc");

});
$("#ChangePassword").click(function () {
    $("#curPassword").hide();
    var html = '';
    var object = {
        Password: $('#Password').val(),
        NewPassword: $('#NewPassword').val(),
        ConfirmPassword: $('#ConfirmPassword').val()
    };
    if (object.Password === '') {
        html += 'Mật khẩu trống !';
        $("#prePassword").html(html);
        $("#prePassword").show();
        $("#Password").focus();
        $('#Password').css("border-color", "red");
        return false;
    }
    else {
        $("#prePassword").hide();
        $('#Password').css("border", "none");
    }
    if (object.NewPassword === '') {
        html += 'Mật khẩu mới trống !';
        $("#preNewPassword").html(html);
        $("#preNewPassword").show();
        $("#NewPassword").focus();
        $('#NewPassword').css("border-color", "red");
        return false;
    }
    else {
        $("#preNewPassword").hide();
        $('#NewPassword').css("border", "none");
    }
    if (object.ConfirmPassword === '') {
        html += 'Xác nhận mật khẩu trống !';
        $("#preConfirmPassword").html(html);
        $("#preConfirmPassword").show();
        $("#ConfirmPassword").focus();
        $('#ConfirmPassword').css("border-color", "red");
        return false;
    }
    else {
        $("#preConfirmPassword").hide();
        $('#ConfirmPassword').css("border", "none");
    }
    if (object.NewPassword !== object.ConfirmPassword) {
        html += 'Mật khẩu không khớp mật khẩu mới !';
        $("#curConfirmPassword").html(html);
        $("#curConfirmPassword").show();
        $("#ConfirmPassword").focus();
        $('#ConfirmPassword').css("border-color", "red");
        return false;
    }
    else {
        $("#curConfirmPassword").hide();
        $('#ConfirmPassword').css("border", "none");
    }
    Id = parseInt($(".MyId").attr("id"));
    if (object.Password)
        $.ajax({
            type: "POST",
            url: "/Home/ConfirmPassword?id=" + Id,
            data: JSON.stringify(object),
            contentType: "application/json;charset=utf-8",
            dataType: "json",
            success: function (result) {
                if (result.isvalid) {
                    url = "/Home/SavePassword?id=" + Id;
                    $.ajax({
                        type: "POST",
                        url: url,
                        data: JSON.stringify(object),
                        contentType: "application/json;charset=utf-8",
                        dataType: "json",
                        success: function (result) {
                            $(".ChangePass").hide(150);
                            $("#Password").val('');
                            $("#NewPassword").val('');
                            $("#ConfirmPassword").val('');

                        },
                        error: function (errormessage) {
                            alert(errormessage.responseText);
                        }
                    });
                }
                else {
                    html += 'Nhập sai mật khẩu cũ !';
                    $("#curPassword").html(html);
                    $("#curPassword").show();
                    $('#Password').focus();
                    $('#Password').css("border-color", "red");
                    return false;
                }
            },
            error: function (message) {
                alert(message.responseText);
            }
        });
});

