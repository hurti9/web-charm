import os, json
from gevent.wsgi import WSGIServer

from sqlite3 import dbapi2 as sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, render_template, flash, app
from contextlib import closing
import database_helper

app = Flask(__name__)
app.config.from_object(__name__)


@app.errorhandler(404)
def page_not_found(error):
    return 'This page does not exist', 404
@app.route('/')
def root():
    return app.send_static_file('Client.html')
@app.route('/sign_up/',methods=['POST'])
def signup():
    if request.method=='POST':
        print('signup')
        first_name=request.form.get('first_name')
        family_name =request.form.get('family_name')
        gender = request.form.get('gender')
        city = request.form.get('city')
        country = request.form.get('country')
        email = request.form.get('email')
        password = request.form.get('password')
        print(first_name,family_name,gender,city,country,email,password)
        result = database_helper.signup_user(first_name,family_name,gender,city,country,email,password)
        if result == True:
            data = {}
            data['success'] = True
            json_token = json.dumps(data)
            return json_token
        else:
            data = {}
            data['success'] = False
            json_token = json.dumps(data)
            return json_token
@app.route('/signin/<email>/<password>/', methods=['GET'])
def sign_in(email,password):
    if request.method=='GET':
        #email=str(request.args.get('email'))
        #password=str(request.args.get('password'))
        token=database_helper.sign_in(email=email,password=password)
        if token is not False:
            print('okej')
            data = {}
            data['success'] = True
            data['data'] = token
            json_token = json.dumps(data)
            return json_token
        else:
            data = {}
            data['success'] = False
            json_token = json.dumps(data)
            return json_token
@app.route('/sign_out/<token>/', methods=['GET'])
def sign_out(token):
     if request.method=='GET':
        mess= database_helper.logout(token=str(token))
        return mess
@app.route('/change_password/',methods=['POST'])
def change_password():
    if request.method=='POST':
        token=request.form.get('token')
        new=request.form.get('new')
        old=request.form.get('old')
        changes = database_helper.change(token,new, old)
        if changes is not False:
            data = {}
            data['success'] = True
            data['message'] = 'Changed'
            json_token = json.dumps(data)
            return json_token
        else:
            data = {}
            data['success'] = False
            data['message'] = 'Unsuccessful'
            json_token = json.dumps(data)
            return  json_token

@app.route('/getusertoken/<token>/',methods=['GET'])
def getusertoken(token):
    if request.method=='GET':
        user_data = database_helper.get_user_data_by_token(token=token)
        if user_data is not False:
            return str(user_data)
        else:
            data = {}
            data['success'] = False
            data['message'] = 'Unsuccessful'
            json_token = json.dumps(data)
            return  json_token

    return
@app.route('/finduser/<token>/<email>/',methods=['GET'])
def finduser(token,email):
    found= database_helper.get_user_data_by_email(token=token,email=email)
    if found is not None:
        return found
    else:
         data = {}
         data['success'] = False
         data['message'] = 'Unsuccessful'
         json_token = json.dumps(data)
         return  json_token
@app.route('/getusermessages/<token>/',methods=['GET'])
def get_user_messages_by_token(token):
    if request.method=='GET':
        messages = database_helper.getmessagesbytoken(token=token)
        if messages is not None:
            return json.dumps(messages)
        else:
         data = {}
         data['success'] = False
         data['message'] = 'Unsuccessful'
         json_token = json.dumps(data)
         return  json_token
@app.route('/getusermessagesbyemail/<email>/<token>/',methods=['GET'])
def get_user_messages_by_email(email,token):
        messages=database_helper.getmessagesbyemail(email=email,token=token)
        if messages is not None:
            return json.dumps(messages)
        else:
         data = {}
         data['success'] = False
         data['message'] = 'Unsuccessful'
         json_token = json.dumps(data)
         return  json_token
@app.route('/postmessage/',methods=['POST'])
def post_message():
    if request.method=='POST':

        token=request.form.get('token')
        wall=request.form.get('wall')
        message=request.form.get('message')
        print(token,wall,message)
        posted=database_helper.postmessage(token,wall,message)
    return posted
def init_db():
    with closing(database_helper.connect_db()) as db:
        with app.open_resource('schema.sql', mode='r') as f:
            db.cursor().executescript(f.read())
        db.commit()

if __name__ == '__main__':
    app.run()

