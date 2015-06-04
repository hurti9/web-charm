var socket = new WebSocket("ws://192.168.1.252:5001/socket.io/test");
                    socket.onopen=function(){
                         if (localStorage.getItem("token")!=undefined){
                             token= localStorage.getItem("token");
                             socket.send("open,"+token);
                         } else{
                             displaywelcomeView();
                         }

                    }
                    socket.onmessage=function(msg){
                        var tok=msg.data.toString();
                            if(tok=="signout"){
                                sign_out();
                            }else if(tok=="signedin"){
                                displayprofileView();
                            } else{
                                displaywelcomeView();
                            }

                    }
                    socket.onclose=function(){
                    }
displayprofileView = function(){
    document.getElementById("view").innerHTML = document.getElementById("profileView").innerHTML;
    showTab(document.getElementById("tabs1"));
    get_user();
    get_wall();
}
displaywelcomeView = function(){
document.getElementById("view").innerHTML = document.getElementById("welcomeView").innerHTML;
};
window.onload = function(){
};
window.onbeforeunload = function() {
	socket.send("close");
  	socket.close();
};
sign_up = function(){
    //alert("sign-up kallas men skickar get istället för post...");
	var password = document.forms["signup"]["password"].value;
	var repassword = document.forms["signup"]["repassword"].value;
	if(password==repassword && password.length>=3){
		var newUser = {"email": document.forms["signup"]["email"].value,
                "password": document.forms["signup"]["password"].value,
                "firstname": document.forms["signup"]["firstname"].value,
                "familyname": document.forms["signup"]["familyname"].value,
                "gender": document.forms["signup"]["gender"].value,
                "city": document.forms["signup"]["city"].value,
                "country": document.forms["signup"]["country"].value}
		var fromServer = new XMLHttpRequest();
        var url = "/sign_up/";
        var params = "first_name="+newUser.firstname.toString()+"&family_name="+newUser.familyname.toString()+
        "&gender="+newUser.gender.toString()+"&city="+newUser.city.toString()+"&country="+newUser.country.toString()
        +"&email="+newUser.email.toString()+"&password=" +newUser.password.toString();
        fromServer.open("POST",url,true);
        fromServer.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        fromServer.setRequestHeader("Content-length", params.length);
        fromServer.setRequestHeader("Connection", "close");
        fromServer.onreadystatechange=function(){
            if(fromServer.readyState==4 && fromServer.status==200){
                resp=JSON.parse(fromServer.responseText);
                if(resp.success==true){
                document.forms["login"]["password"].value=document.forms["signup"]["password"].value;
                document.forms["login"]["email"].value=document.forms["signup"]["email"].value;
                log_in();
        } else{
            document.forms["signup"]["email"].style.borderColor = "red";
        }
            }
        }
        fromServer.send(params);
	} else{
		document.forms["signup"]["password"].style.borderColor = "red";
		document.forms["signup"]["repassword"].style.borderColor = "red";
        return false;
	}
}
log_in = function(){
	var password = document.forms["login"]["password"].value;
	if(password.length>=3){
		var loginUser ={"email": document.forms["login"]["email"].value,
                        "password": document.forms["login"]["password"].value};
        var login_response = new XMLHttpRequest();
        login_response.open("GET","/signin/"+loginUser.email+"/"+loginUser.password+"/",true);
        login_response.onreadystatechange=function(){
            if(login_response.readyState==4 && login_response.status==200){
                var token = JSON.parse(login_response.responseText);
                if(token.success==true) {
                localStorage.setItem("token", token.data);
                    socket.send("open,"+token.data);
            }
         else{
            document.forms["login"]["password"].style.borderColor = "red";
            document.forms["login"]["email"].style.borderColor = "red";
            return false;
        }
            }
        }
        login_response.send();
	} else{
		document.forms["login"]["password"].style.borderColor = "red";
	}
}
changePassword = function() {
    var oldPass = document.forms["changepw"]["oldPassword"].value;
    var newPass = document.forms["changepw"]["newPassword"].value;
    if (newPass.length >= 3) {
    var token =localStorage.getItem("token");
        var fromChange = new XMLHttpRequest();
        fromChange.open("POST","/change_password/",true);
        fromChange.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        fromChange.onreadystatechange=function(){
            if(fromChange.readyState==4 && fromChange.status==200){
                resp=JSON.parse(fromChange.responseText);
                document.getElementById("pw_message").innerHTML=resp.message;
            }
        }
        fromChange.send("token="+token+"&new="+newPass+"&old="+oldPass);
        document.getElementById("pw_message").innerHTML = fromChange.message;
        document.forms["changepw"]["oldPassword"].value = "";
        document.forms["changepw"]["newPassword"].value = "";
        return false;
    }else{
        document.getElementById("pw_message").innerHTML = "Too short password!"
        return false;
    }
   }

sign_out = function() {
    var token = localStorage.getItem("token");
    var logoutServer = new XMLHttpRequest();
        logoutServer.open("GET","/sign_out/"+token+"/",true);
        logoutServer.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        logoutServer.onreadystatechange=function(){
        if(logoutServer.readyState==4 && logoutServer.status==200){
            var resp =JSON.parse(logoutServer.responseText);
            if(resp.success=='True'){
                socket.send("close");
                localStorage.removeItem("token");
                displaywelcomeView()
                    }
            }
        }
    logoutServer.send();
    localStorage.removeItem("token");
}

findUser = function(){
    var email = document.forms["find_user"]["search_user"].value;
    var token = localStorage.getItem("token");
    var foundreq= new XMLHttpRequest();
    foundreq.open("GET","/finduser/"+token+"/"+email+"/");
    foundreq.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    foundreq.onreadystatechange=function(){
        if(foundreq.readyState==4 && foundreq.status==200){
            //alert(foundreq.responseText);
            var found=JSON.parse(foundreq.responseText);
            document.getElementById("browse-container").style.visibility="visible";
            if(found.success!=false) {
                document.getElementById("browse_email").innerHTML = email;
                Print_user(found);

                var getmess = new XMLHttpRequest();
                getmess.open("GET", "/getusermessagesbyemail/" + email + "/" + token + "/", true);
                getmess.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                getmess.onreadystatechange = function () {
                    if (getmess.readyState == 4 && getmess.status == 200) {
                        get_wall();
                        var wall_data = JSON.parse(wall.responseText);
                        print_wall(wall_data);
                    }
                }
                getmess.send();
            }
        }

            return false;
    }
    foundreq.send();
}
get_user= function(){
    var token = localStorage.getItem("token");

    var getuser = new XMLHttpRequest();
    getuser.open("GET","/getusertoken/"+token+"/",true);
    getuser.setRequestHeader("Content-type","application/x-www-form-urlencoded");
    getuser.onreadystatechange=function(){
        if(getuser.readyState==4 && getuser.status==200){
            //alert(getuser.responseText);
            var user=JSON.parse(getuser.responseText);
            document.getElementById("home_email").innerHTML = user.email;
            Print_user(user);
        }
    }
    getuser.send();
    return false;
}
function Print_user(user){

if (document.getElementById("current_tab").innerHTML == "tabs-1") {
 document.getElementById("current_user").innerHTML = user.firstname + ", "
    + user.familyname + ", " + user.gender + ", " + user.city
    + ", "+ user.country;
}else{
document.getElementById("other_user").innerHTML = user.firstname + ", "
    + user.familyname + ", " + user.gender + ", " + user.city
    + ", "+ user.country;
}
    return false;
}
pMessage = function(){
    var token = (localStorage.getItem("token"));
    if (document.getElementById("current_tab").innerHTML == "tabs-1"){
        var message = document.forms["user_post"]["post_userw"].value;
        document.getElementById("post_userw").value = "";

        var email = document.getElementById("home_email").innerHTML;
        var message_posted = new XMLHttpRequest();
        message_posted.open("POST","/postmessage/",true);
        message_posted.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        message_posted.onreadystatechange=function(){
            if(message_posted.readyState==4 && message_posted.status==200){
                var mess=JSON.parse(message_posted.responseText);
            }
        }
        message_posted.send("token="+token.toString()+"&wall="+email+"&message="+message);
    }else{
        var message = document.forms["other_post"]["post_otherw"].value;
        document.getElementById("post_otherw").value = "";
        var email = document.getElementById("browse_email").innerHTML;
                var message_posted = new XMLHttpRequest();
        message_posted.open("POST","/postmessage/",true);
        message_posted.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        message_posted.onreadystatechange=function(){
            if(message_posted.readyState==4 && message_posted.status==200){
              var mess=JSON.parse(message_posted.responseText);
            }
        }
        message_posted.send("token="+token+"&wall="+email+"&message="+message);
    }
    get_wall();
    return false;
}
function get_wall(){

    var token = localStorage.getItem("token");

    if (document.getElementById("current_tab").innerHTML == "tabs-1") {

        var wall=new XMLHttpRequest();
        wall.open("GET","/getusermessages/"+token+"/",true);
        wall.setRequestHeader("Content-type","application/x-www-form-urlencoded");
        wall.onreadystatechange=function(){
            if(wall.readyState==4 && wall.status==200){
                //alert(wall.responseText);
                var wall_data=JSON.parse(wall.responseText);
                if(wall_data.success==true){
                    print_wall(wall_data.messages);
                }

            }
        }
        wall.send();
    }else{
        var email = document.getElementById("browse_email").innerHTML;
        var wall = new XMLHttpRequest();
        wall.open("GET","/getusermessagesbyemail/"+email+"/"+token+"/",true);
            wall.setRequestHeader("Content-type","application/x-www-form-urlencoded");
            wall.onreadystatechange=function(){
            if(wall.readyState==4 && wall.status==200){
                //alert(wall.responseText);
                var wall_data=JSON.parse(wall.responseText);
                if(wall_data.success==true){print_wall(wall_data.messages);
                }

            }
        }
        wall.send();
    }
return false;
}

function print_wall(wall_data){
    var posts = wall_data;
    if (document.getElementById("current_tab").innerHTML == "tabs-1"){
        var myNode = document.getElementById("wall_user-div");
    }else{
        var myNode = document.getElementById("wall_other-div");
    }
    while (myNode.firstChild) {
    myNode.removeChild(myNode.firstChild);
    }

    for (i = 0; i < posts.length; i++){
            var post = document.createElement("P");
            var w = document.createTextNode(posts[i][1]
            + ":  ");
            var c = document.createTextNode(posts[i][0]);
            post.appendChild(w);
            post.appendChild(c);
            myNode.appendChild(post);
        }
    return false;
}
function showTab(element)  {
    var tabContents = document.getElementsByClassName('tabContent');
    for (var i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = 'none';
    }

    // change tabsX into tabs-X in order to find the correct tab content
    var tabContentIdToShow = element.id.replace(/(\d)/g, '-$1');
    document.getElementById(tabContentIdToShow).style.display = 'block';
    document.getElementById("current_tab").innerHTML = tabContentIdToShow;
}

function drag(element) {
    element.dataTransfer.setData("drag-id", element.target.id);
}

function allowDrop(element) {
    element.preventDefault();
}

function drop(element) {
    element.preventDefault();
    var data = element.dataTransfer.getData("drag-id");
    document.getElementById(element.target.id).value = document.getElementById(data).innerHTML;
}