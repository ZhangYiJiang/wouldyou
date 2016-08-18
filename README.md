## Setup
 
 1. Check you have the prerequisites installed. Python 3.5 is required for the server and Node 6.x and gulp is required for the asset pipeline. 
 
 2. Grab a copy of the repo with `git clone`
 
 3. Create a Python 3.5 virtual environment somewhere (home folder usually) by following the instruction from https://docs.python.org/3/library/venv.html and activate it by running `source /path/to/venv/bin/activate`
 
 4. Install the Python prerequisites with
 
        cd cs3216_wouldyou
        pip install -r requirements.txt
        
 5. Create the `.env` using 
    
        cd cs3216_wouldyou
        cp .env.example .env
        nano .env 
    
    and fill in the blanks. 
     
     - `SECRET_KEY` can be created using http://www.miniwebtool.com/django-secret-key-generator/
     - `FACEBOOK_KEY` and `FACEBOOK_SECRET` is from http://developer.facebook.com. Use the test app for local testing and the actual app for staging and production 
     
 6. Return to the project root (`cd ..`) and run the database migrations using `./manage.py migrate` or for OSX `python manage.python migrate`
 
 7. Start the server using `./manage.py runserver` or for OSX `python manage.python runserver` 
 
 8. Create a superuser using `./manage.py createsuperuser` and follow the instructions 

### To start with the asset pipeline, 
 
 1. Change to the aseet directory `cd wouldyou/assets`
 2. Install the prerequisites `npm install`
 3. If necessary, install gulp globally `npm i -g gulp`
 4. Run `gulp serve` to start the Browsersync server, *or* 
 5. Run `gulp watch` to watch for asset changes without using Browsersync
 
 
### To deploy

 1. Ensure you have a ssh key registered with the `app` user of the server 
 2. [Install Fabric](http://www.fabfile.org/installing.html)
 3. Run `fab staging` from the project directory 

