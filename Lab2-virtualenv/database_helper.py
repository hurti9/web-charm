import os,json
DATABASE = 'database.db'
DEBUG = False
SECRET_KEY = 'development key'
USERNAME = 'admin'
PASSWORD = 'default'
static_url_path='/static'
from sqlite3 import dbapi2 as sqlite3
from flask import Flask, request, session, g, redirect, url_for, abort, \
     render_template, flash, app, request
from contextlib import closing
from uuid import uuid4


def connect_db():
     return sqlite3.connect('database.db')
def get_db():
    if not hasattr(g, 'sqlite_db'):
        g.sqlite_db = connect_db()
    return g.sqlite_db
def close_db():
    if hasattr(g, 'sqlite_db'):
        g.sqlite_db.close()
def signup_user(firstname,familyname,gender,city,country,email,password):
    conn=sqlite3.connect('database.db')
    c = conn.cursor()
    try:
        c.execute("INSERT INTO users VALUES (?,?,?,?,?,?,?);",(firstname,familyname,gender,city,
                                                               country,email,password))
    except sqlite3.Error:
        print('error in execution of signup')
        return False
    conn.commit()
    conn.close()
    return True
def sign_in(email,password):
    conn=sqlite3.connect('database.db')
    c = conn.cursor()
    try:
        c.execute("SELECT password FROM users WHERE email = ?;",(email,))
    except sqlite3.Error:
        return False
    conn.commit()
    fetched_pass=str(c.fetchone())#comes in a (u'password') format so a split is needed
    fetched_pass=fetched_pass.split('\'')
    print(fetched_pass[1]+' '+password)
    if fetched_pass[1]==password:
        token=str(uuid4())
        try:
            c.execute("INSERT INTO logged VALUES (?,?);",(str(email),str(token)))
        except sqlite3.Error:
            return False
        conn.commit()
        conn.close()
        return token
    else:
        return False
def logout(token):
    conn=sqlite3.connect('database.db')
    c = conn.cursor()
    try:
        c.execute("DELETE FROM logged WHERE token = ?;",(token,))
    except sqlite3.Error:
        print('fail')
        return False
    conn.commit()
    conn.close()
    data={}
    data['success']='True'
    user_data = json.dumps(data)
    return user_data
def change(token,new,old):
    print(token,new,old)
    conn=sqlite3.connect('database.db')
    c = conn.cursor()
    try:
        c.execute("select users.email from"
                  " users INNER JOIN logged on users.email = logged.email WHERE token=?;",(token,))
    except sqlite3.Error:
        print('token not logged in')
        return False
    fetched_email=str(c.fetchone())#comes in a (u'password') format so a split is needed
    fetched_email=fetched_email.split('\'')
    try:
        c.execute("update users set password=? WHERE email=? AND password=?;",(new,fetched_email[1],old,))
    except sqlite3.OperationalError:
        print('something went horribly wrong')
        return False
    print(c.rowcount)
    if(c.rowcount < 1):
        return False
    conn.commit()
    conn.close()
    return True
def get_user_data_by_token(token):
    conn=sqlite3.connect('database.db')
    c = conn.cursor()
    try:
        c.execute("select firstname,familyname,gender,city,country,users.email from"
                  " users INNER JOIN logged on users.email = logged.email WHERE token=?;",(token,))
    except sqlite3.Error:
        print('token not logged in')
        return False
    fetched=c.fetchall()
    for row in fetched:
        data = {}
        data['success'] = True
        data['firstname'] = row[0]
        data['familyname'] =row[1]
        data['gender'] = row[2]
        data['city'] = row[3]
        data['country'] =row[4]
        data['email']=row[5]
        user_data = json.dumps(data)
        print(user_data)
        conn.commit()
        conn.close()
    return user_data
def get_user_data_by_email(token,email):
    conn=sqlite3.connect('database.db')
    c=conn.cursor()
    try:
        c.execute("select email from logged WHERE token=?;",(token,))
    except sqlite3.Error:
        print('not logged in')
        return False
    for row in c.fetchone():
        loggeduser=row[0]
    if loggeduser is not None:
        try:
            c.execute("select firstname,familyname,gender,city,country from users WHERE email=?;",(email,))
        except sqlite3.InternalError:
            print('no')
            return False
        fetched=c.fetchall()
        for row in fetched:
            data = {}
            data['success'] = True
            data['firstname'] = row[0]
            data['familyname'] =row[1]
            data['gender'] = row[2]
            data['city'] = row[3]
            data['country'] =row[4]
            user_data = json.dumps(data)
        print(user_data)
        conn.commit()
        conn.close()
    return user_data
def getmessagesbytoken(token):
    conn=sqlite3.connect('database.db')
    c=conn.cursor()
    try:
        c.execute("SELECT post,author FROM posts WHERE wallowner IN (SELECT email FROM logged WHERE token = ?);",(token,))
    except sqlite3.Error:
        print('not logged in')
        return False
    messages=c.fetchall()
    data={}
    for row in messages:
        print(row[1])
        data['message']=row[0]
        data['author']=row[1]
    conn.commit()
    conn.close()
    return messages
def getmessagesbyemail(email,token):
    conn=sqlite3.connect('database.db')
    c=conn.cursor()
    try:
        c.execute("select email from logged WHERE token=?",(token,))
    except:
        sqlite3.Error
        return 'not logged in'
    loggedin=c.fetchone()
    #if loggedin = en emailaddress
    try:
        c.execute("select post,author from posts WHERE wallowner=?",(email,))
    except:
        sqlite3.Error
        return 'no messages'
    messages=c.fetchall()
    data={}
    for row in messages:
        print(row[1])
        data['message']=row[0]
        data['author']=row[1]
    #data['svar']='success'
    conn.commit()
    conn.close()
    return messages

def postmessage(token,wall,message):
    conn=sqlite3.connect('database.db')
    c=conn.cursor()
    try:
        c.execute("select email from logged WHERE token=?",(token,))
    except:
        sqlite3.IntegrityError
        return 'not logged in'
    loggedin=c.fetchone()

    loggedin=str(loggedin).split('\'')
    print(wall,loggedin[1],message)
    try:
        c.execute("INSERT into posts VALUES (?,?,?)",(wall,loggedin[1],message,))
    except sqlite3.Error:
         data = {}
         data['success'] = False
         data['message'] = 'Unsuccessful'
         json_token = json.dumps(data)
         return  json_token
    conn.commit()
    conn.close()
    data = {}
    data['success'] = True
    data['message'] = 'Posted'
    json_token = json.dumps(data)
    return  json_token
