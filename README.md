
### Run local server

The simplest probably is to use Python's built-in http server. 

If you have [Python](http://python.org/) installed, it should be enough to run this from a command line:

```bash
# Python 2.x
python -m SimpleHTTPServer
```

```bash
# Python 3.x
python -m http.server
```

This will serve files from the current directory at localhost under port 8000:

http://localhost:8000/

If you have Ruby installed, you can get the same result running this instead:

```bash
ruby -r webrick -e "s = WEBrick::HTTPServer.new(:Port => 8000, :DocumentRoot => Dir.pwd); trap('INT') { s.shutdown }; s.start"
```

PHP also has a built-in web server, starting with php 5.4.0:
```bash
php -S localhost:8000
```

Node.js has a simple HTTP server package. To install:
```bash
npm install http-server -g
```

To run:
```bash
http-server .
```