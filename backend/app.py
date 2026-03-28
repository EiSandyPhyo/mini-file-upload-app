import os   #file operations like reading file, saving file, deleting file ...
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename  #To secure the filename


app = Flask(__name__)   
CORS(app)

ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp", "pdf", "txt", "doc", "docx"}
MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB

app.config["MAX_CONTENT_LENGTH"] = MAX_FILE_SIZE

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)   #if the folder does not exist, create it
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER 


@app.route("/")
def home():
    return jsonify({"message": "Flask backend is running"})


@app.errorhandler(413)
def too_large(error):
    return jsonify({"error": "File is too large. Maximum size is 5 MB."}), 413


@app.route("/api/upload", methods=["POST"])  
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files["file"]  #gets file from frontend

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400
    
    if not allowed_file(file.filename):
        return jsonify({
            "error": "File type not allowed. Allowed types: png, jpg, jpeg, gif, webp, pdf, txt, doc, docx"
        }), 400
    
    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    return jsonify({"message": "Uploaded successfully", "filename": filename})


@app.route("/api/delete/<filename>", methods=["DELETE"])
def delete_file(filename):
    safe_filename = secure_filename(filename)
    filepath = os.path.join(UPLOAD_FOLDER, safe_filename)

    if not os.path.exists(filepath):
        return jsonify({"error": "File not found"}), 404

    os.remove(filepath)

    return jsonify({
        "message": "File deleted successfully",
        "filename": safe_filename
    })


@app.route("/api/files", methods=["GET"]) 
def list_files():
    files = os.listdir(UPLOAD_FOLDER)  
    files.sort()
    return jsonify(files) 


@app.route("/uploads/<filename>", methods=["GET"])
def get_uploaded_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


if __name__ == "__main__":
    app.run(debug=True)