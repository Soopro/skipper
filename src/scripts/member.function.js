/**
 * Created by peon on 15/5/25.
 */

$(document).ready(function () {


    init();

    console.log(owner);
    console.log(cookie_domain);
    //open
    $('#register').click(function (e) {
        var login = $('[name="login"]').val();
        var pwd = $('[name="pwd"]').val();
        var pwd2 = $('[name="pwd2"]').val();
        var name = $('[name= "name"]').val();
        var email = $('[name="email"]').val();
        var photo = $('[name="photo"]').val();
        var mobile = $('[name="mobile"]').val();
        if(pwd != pwd2){
            $("#false").show();
            return false;
        }
        var request = {
            type: resource.register.type,
            url: resource.register.url,
            body: {
                login: login,
                pwd: pwd,
                pwd2: pwd2,
                name: name,
                email: email,
                photo: photo,
                mobile: mobile
            }
        };
        AjaxRequest(
            request,
            function success(data){
                console.log(data);
                $("#goin").show();
                $("#seccesed").show();
                $("#false").hide();
            },
            function error(error){
                console.log(error);
                $("#false").show();
            }
        );
        return false;
    });
    var token = $.cookie("auth");
    var get_profile = function(){
        var token = $.cookie("auth");
        var request = {
            type: resource.profile.get.type,
            url: resource.profile.get.url,
            body: {
            },
            authorization: "Bearer " + token
        };
        console.log(request);
        AjaxRequest(
            request,
            function success(data){
                console.log(data);
                $.cookie('profile', JSON.stringify(data), {expires: 7});
            },
            function error(error){
                console.error(error);
            }
        );
    };
    var profile = $.cookie('profile');
    get_profile_cookie = function(){
        console.log(profile);
        if(profile && profile != 'null'){
            profile = JSON.parse(profile);
            $('#profile .member-name').html(profile.name);
            $('#profile .member-email').html(profile.email);
            $('#profile .member-photo').html(profile.photo);
            $('#profile .member-mobile').html(profile.mobile);
        }
    };

    if(profile && profile != 'null'){
        $("#log").hide();
        $("#profile").show();
        $("#logout").show();
    }else{
        $("#log").show();
        $("#profile").hide();
        $("#logout").hide();
    }
    $("#goin").hide();

    get_profile_cookie();

    var get_applyment = function () {
        var token = $.cookie("auth");
        console.log(token);
        var request = {
            type: resource.applyment.get.type,
            url: resource.applyment.get.url,
            body: {
            },
            authorization: "bearer " + token
        };
        console.log(request);
        AjaxRequest(
            request,
            function success(data){
                console.log(data);
                for(var i = 0; i < data.length; i++){
                    $('.applyment').html("<p>"+data[i].activity_id+"<p/>" + "<p>" + data[i].message + "<p/>");
                }
                console.log("applyment");
            },
            function error(error){
                console.error(error);
                console.log("no_applyment");
            }
        );

    };

    get_applyment();



    $('#login').click(function () {
        var login = $('[name="LoginName"]').val();
        var pwd = $('[name="LoginPwd"]').val();
        if(!login || !pwd)
        {
            $("#null").show();
            $("#false").hide();
            return false;
        }else{
            var request = {
                type: resource.login.type,
                url: resource.login.url,
                body: {
                    login: login,
                    pwd: pwd
                }
            };
        }
        AjaxRequest(
            request,
            function success(data){
                $.cookie(
                    "auth",
                    data.member_token,
                    {expires: 7}
                );
                console.log(data);
                console.log($.cookie("auth"));
                get_profile();
                $("#goin").show();
                $("#seccesed").show();
                $("#false").hide();
                $("#null").hide();
            },
            function error(error){
                $("#null").hide();
                $("#false").show();
            }
        );
        return false;
    });

    $('#recover_pwd').click(function () {
        var login = $('[name="RecoverPwdName"]').val();
        if(!login){
            $("#null").show();
            $("#false").hide();
        }else{
            var request = {
                type: resource.recover_pwd.type,
                url: resource.recover_pwd.url,
                body: {
                    login: login
                }
            };
        }

        AjaxRequest(
            request,
            function success(data){
                console.log(data);
                $("#goin").show();
                $("#seccessed").show();
                $("#false").hide();
                $("#null").hide();
            },
            function error(error){
                console.log(error);
                $("#false").hide();
                $("#null").hide();
            }
        );
        return false;
    });

    $('#create_applyment').click(function () {
        var name = $('[name="UserName"]').val();
        var activity = $('[name="activity"]').val();
        var message = $('[name="message"]').val();
        if(!name){
            $(".namenull").show();
            $(".idnull").hide();
            $(".false").hide();
            return false;
        }else if(!activity){
            $(".namenull").hide();
            $(".idnull").show();
            $(".false").hide();
            return false;
        }else{
            var request = {
                type: resource.create_applyment.type,
                url: resource.create_applyment.url,
                body: {
                    name: name,
                    activity: activity,
                    message: message
                }
            };
        }
        AjaxRequest(
            request,
            function success(data){
                console.log(data);
                console.log("yes!");
            },
            function error(error){
                console.log(error);
                console.log("no!");
                $(".namenull").hide();
                $(".idnull").hide();
                $(".false").show();
            }
        );
        return false;
    });
    $("#join_applyment").click(function (){
        var name = profile.name;
        var activity = $('[name="activity"]').val();
        var message = $('[name="message"]').val();
        if(!activity) {
            $(".idnull").show();
            $(".false").hide();
            return false;
        }else {
            var request = {
                type: resource.applyment.post.type,
                url: resource.applyment.post.url,
                body: {
                    name: name,
                    activity: activity,
                    message: message
                },
                authorization: "Bearer " + token
            }
        }
        AjaxRequest(
            request,
            function success(data){
                console.log(data);
                console.log("yes!");
            },
            function error(error){
                console.log(error);
                console.log("no!");
                $(".idnull").hide();
                $(".false").show();
            }
        );
    });
    //need
    $('#logout').click(function(){
        var token = $.cookie("auth");
        var request = {
            type: resource.logout.type,
            url: resource.logout.url,
            body: {},
            authorization: "Bearer " + token
        };
        console.log(request);
        AjaxRequest(
            request,
            function success(data){
                console.log(data);
                $.cookie("auth",null);
                $.cookie("profile",null);
                $("#log").show();
                $("#profile").hide();
                $("#logout").hide();
            },
            function error(error){
                console.log(error);
                $.cookie("profile",null);
            }
        );
        return false;
    });
    $('#update_password').click(function(){
        var pwd = $('[name="new_pwd"]').val();
        var pwd2 = $('[name="new_pwd2"]').val();
        if(!pwd && !pwd){
            $('#false').hide();
            $('#pass').hide();
            $('#same').hide();
            $('#seccesed').hide();
            $('#null').show();
            return false;
        }else if(pwd != pwd2){
            $('#false').hide();
            $('#null').hide();
            $('#pass').hide();
            $('#seccesed').hide();
            $("#same").show();
            return false;
        }
        else{
            var request = {
                type: resource.update_pwd.type,
                url: resource.update_pwd.url,
                body: {
                    pwd: pwd,
                    pwd2: pwd2
                },
                authorization: "Bearer " + token
            };
        }

        AjaxRequest(
            request,
            function success(data){
                $.cookie('profile', data);
                $.cookie('profile', JSON.stringify(data), {expires: 7});
                console.log(data);
                $('#false').hide();
                $('#null').hide();
                $('#pass').hide();
                $('#seccesed').hide();
                $("#same").hide();
                console.log("fine");
            },
            function error(error){
                console.log(error);
                console.log("wrong");
            }
        );
        return false;
    });


    //
    //$('#get_profile').click(function(){
    //    var request = {
    //        type: resource.profile.get.type,
    //        url: resource.profile.get.url,
    //        body: {
    //        },
    //        authorization: "Bearer " + token
    //    };
    //    console.log(request);
    //    AjaxRequest(
    //        request,
    //        function success(data){
    //            console.log(data);
    //            $('[name="MemberName"]').val(data.name);
    //            $('[name="MemberEmail"]').val(data.email);
    //            $('[name="MemberPhoto"]').val(data.photo);
    //            $('[name="MemberMobile"]').val(data.mobile);
    //        },
    //        function error(error){
    //            console.log(error);
    //        }
    //    );
    //    return false;
    //});
    $('#edit_profile').click(function() {
        var name = $('[name="MemberName"]').val();
        var email = $('[name="MemberEmail"]').val();
        var photo = $('[name="MemberPhoto"]').val();
        var mobile = $('[name="MemberMobile"]').val();
        if(!name && !email && !photo && !mobile){
            $('#false').show();
            console.log("wrong");
            return false;
        }else{
            var request = {
                type: resource.profile.put.type,
                url: resource.profile.put.url,
                body: {
                    name: name,
                    email: email,
                    photo: photo,
                    mobile: mobile
                },
                authorization: "Bearer " + token
            };
        }
        AjaxRequest(
            request,
            function success(data){
                $.cookie('profile', data);
                $.cookie('profile', JSON.stringify(data), {expires: 7});
                console.log(profile);
                $('#false').hide();
                $('#null').hide();
                $('#pass').hide();
                $('#same').hide();
                console.log('right');
                $('#seccesed').show();
            },
            function error(error){
                console.log(error);
                console.log("wrong");
            }
        );
        return false;
    });
    $('#make_applyment').click(function () {
        var name = $('[name="ApplyUserName"]').val();
        var activity = $('[name="Applyactivity"]').val();
        var message = $('[name="ApplyMessage"]').val();
        var request = {
            type: resource.applyment.post.type,
            url: resource.applyment.post.url,
            body: {
                name: name,
                activity: activity,
                message: message
            },
            authorization: "Bearer " + token
        };
        AjaxRequest(
            request,
            function success(data){
                console.log(data);
            },
            function error(error){
                console.log(error);
            }
        );
        return false;
    });
    $('#get_memberifo').click(function() {
        var request = {
            type: resource.applyment.get.type,
            url: resource.applyment.get.url,
            body: {
            },
            authorization: "Bearer " + token
        };
        AjaxRequest(
            request,
            function success(data){
                console.log(data);
            },
            function error(error){
                console.log(error);
            }
        );
        return false;
    });

    $('#cancel_applyment').click(function () {
        var request = {
            type: resource.delete_apply.type,
            url: resource.delete_apply.url,
            body: {
            },
            authorization: "Bearer " + token
        };
        AjaxRequest(
            request,
            function success(data){
                console.log(data);

            },
            function error(error){
                console.log(error);
            }
        );
        return false;
    })
});