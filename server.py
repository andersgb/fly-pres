from flask import Flask, request
from flask import render_template
from werkzeug import secure_filename
import os
app = Flask(__name__)


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = set(['txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

@app.route("/")
def hello():
    return render_template('upload.html')

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1] in ALLOWED_EXTENSIONS

@app.route('/upload/', methods=['GET', 'POST'])
def upload_file():
    if request.method == 'POST':
        file = request.files['file']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            foldername = secure_filename(request.form['foldername'])
            folderpath = os.path.join(app.config['UPLOAD_FOLDER'], foldername)
            if not os.path.isdir(folderpath):
                os.mkdir(folderpath)
            file.save(os.path.join(folderpath, filename))
            print "OK"
            return "Success!"
    return 0


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)

