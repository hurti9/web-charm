from geventwebsocket.handler import WebSocketHandler
from gevent.wsgi import WSGIServer
from server import app

http_server = WSGIServer(('',5001), app, handler_class=WebSocketHandler)
http_server.serve_forever()
