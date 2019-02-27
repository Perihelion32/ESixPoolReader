FROM httpd
COPY . /usr/local/apache2/htdocs/
COPY ./docker-httpd.conf /usr/local/apache2/conf/httpd.conf
