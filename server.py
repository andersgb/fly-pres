from flask import Flask, request
from flask import render_template
from werkzeug import secure_filename
import os
import exif
import json

app = Flask(__name__)


UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = set(['JPG', 'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif'])

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

@app.route("/json/<directory>")
def create_json(directory):
    folder_path = os.path.join('uploads', directory)
    json_data = []
    for filename in os.listdir(folder_path):
        fullpath = os.path.join(folder_path, filename)
        if os.path.isfile(fullpath):
            print fullpath
            file_data = {}
            file_data["filename"] = filename
            lat_lon = exif.get_gps_radians(fullpath)
            if lat_lon:
                file_data["latitude"] = lat_lon["latitude"]
                file_data["longitude"] = lat_lon["longitude"]
            else:
                file_data["latitude"] = 0
                file_data["longitude"] = 0
            file_data["height"] = 0
            file_data["roll"] = 0
            file_data["pitch"] = 0
            file_data["heading"] = 0
            json_data.append(file_data)
    with open(os.path.join(folder_path, 'data.json'), 'w') as f:
        json.dump(json_data, f)
    return "Success"

if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True)

