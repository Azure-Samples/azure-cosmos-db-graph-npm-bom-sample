
# PowerShell script to execute the Gruntfile for CSS, check for outdated npm libraries,
# then start the web application with nodemon on localhost.

grunt 

npm outdated

nodemon bin/www
