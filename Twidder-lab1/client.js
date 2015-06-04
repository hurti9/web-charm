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
    if (localStorage.getItem("token")!=undefined){
         displayprofileView();

    } else{
       displaywelcomeView();
    }

};
signup = function(){
	var password = document.forms["signup"]["password"].value;
	var repassword = document.forms["signup"]["repassword"].value;
	if(password==repassword && password.length>=3){
		var newUser = {"email": document.forms["signup"]["email"].value,
                "password": document.forms["signup"]["password"].value,
                "firstname": document.forms["signup"]["name"].value,
                "familyname": document.forms["signup"]["familyname"].value,
                "gender": document.forms["signup"]["gender"].value,
                "city": document.forms["signup"]["city"].value,
                "country": document.forms["signup"]["country"].value}
		var fromServer = serverstub.signUp(newUser);
		if(fromServer.success==true){
            document.forms["login"]["password"].value=document.forms["signup"]["password"].value;
            document.forms["login"]["email"].value=document.forms["signup"]["email"].value;
            login();
        } else{
            document.forms["signup"]["email"].style.borderColor = "red";
        }
	} else{
		document.forms["signup"]["password"].style.borderColor = "red";
		document.forms["signup"]["repassword"].style.borderColor = "red";
        return false;
	}
}
login = function(){
	var password = document.forms["login"]["password"].value;
	if(password.length>=3){
		var loginUser ={"email": document.forms["login"]["email"].value,
                        "password": document.forms["login"]["password"].value};
        var fromServer = serverstub.signIn(loginUser.email,loginUser.password);
        if(fromServer.success==true) {
            localStorage.setItem("token", JSON.stringify(fromServer.data));
                if (localStorage.getItem("token")!=undefined){
                    displayprofileView();
                } else{
                    displaywelcomeView();
    }
        } else{
            document.forms["login"]["password"].style.borderColor = "red";
            document.forms["login"]["email"].style.borderColor = "red";
            return false;
        }


	} else{
		document.forms["login"]["password"].style.borderColor = "red";
	}
}

changePassword = function() {
    var oldPass = document.forms["changepw"]["oldPassword"].value;
    var newPass = document.forms["changepw"]["newPassword"].value;
    if (newPass.length >= 3) {

    var token = JSON.parse(localStorage.getItem("token"));
    var fromChange = serverstub.changePassword(token, oldPass, newPass);
        document.getElementById("pw_message").innerHTML = fromChange.message;
        document.forms["changepw"]["oldPassword"].value = "";
        document.forms["changepw"]["newPassword"].value = "";
        return false;
    }else{
        document.getElementById("pw_message").innerHTML = "Too short password!"
        return false;
    }
    }

logOut = function() {
    var token = JSON.parse(localStorage.getItem("token"));
    var fromOut = serverstub.signOut(token);
    localStorage.removeItem("token");
    displaywelcomeView()
    return true;
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






findUser = function(){
    var email = document.forms["find_user"]["search_user"].value;
    var token = JSON.parse(localStorage.getItem("token"));
    var found = serverstub.getUserDataByEmail(token,email);

    if(found.success==true){
        document.getElementById("browse-container").style.visibility="visible";
        document.getElementById("browse_email").innerHTML = email;
        Print_user(found);
        var wall_data = serverstub.getUserMessagesByEmail(token,email);
        print_wall(wall_data);
    }
    document.getElementById("lb_search").innerHTML = found.message;
    return false;
}

function get_user() {
     var token = JSON.parse(localStorage.getItem("token"));
     var fromUser =serverstub.getUserDataByToken(token);
    document.getElementById("home_email").innerHTML = fromUser.data.email;
    Print_user(fromUser);
    return false;
}

function Print_user(user){
if (document.getElementById("current_tab").innerHTML == "tabs-1") {
 document.getElementById("current_user").innerHTML = user.data.firstname + ", "
    + user.data.familyname + ", " + user.data.gender + ", <br>" + user.data.city
    + ", "+ user.data.country;
}else{
document.getElementById("other_user").innerHTML = user.data.firstname + ", "
    + user.data.familyname + ", " + user.data.gender + ", <br>" + user.data.city
    + ", "+ user.data.country;
}
    return false;
}

pMessage = function(){
    var token = JSON.parse(localStorage.getItem("token"));
    if (document.getElementById("current_tab").innerHTML == "tabs-1"){
        var message = document.forms["user_post"]["post_userw"].value;
        document.getElementById("post_userw").value = "";
        var email = document.getElementById("home_email").value;
        var message_posted = serverstub.postMessage(token, message, email);
        document.getElementById("user_response").innerHTML = message_posted.message;
    }else{
        var message = document.forms["other_post"]["post_otherw"].value;
        document.getElementById("post_otherw").value = "";
        var email = document.getElementById("browse_email").innerHTML;
        var message_posted = serverstub.postMessage(token, message, email);
        document.getElementById("other_response").innerHTML = message_posted.message;
    }
    get_wall();
    return false;
}

function get_wall(){
    var token = JSON.parse(localStorage.getItem("token"));
    if (document.getElementById("current_tab").innerHTML == "tabs-1") {
        var wall_data = serverstub.getUserMessagesByToken(token);
    }else{
        var email = document.getElementById("browse_email").innerHTML;
        var wall_data = serverstub.getUserMessagesByEmail(token,email);
    }
    print_wall(wall_data);
return false;
}

function print_wall(wall_data){
    var posts = wall_data.data;
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
            var w = document.createTextNode(posts[i].writer
            + ":  ");
            //var b = document.createElement("\n");
            var c = document.createTextNode(posts[i].content);
            post.appendChild(w);
            //post.appendChild(b);
            post.appendChild(c);
            myNode.appendChild(post);
        }
    return false;
}

