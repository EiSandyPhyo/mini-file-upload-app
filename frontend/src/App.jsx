// eslint-disable no-unused-vars
import { useEffect, useState } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  File,
  Trash2,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [selectedFile, setSelectedFile] = useState(null); // null=Empty
  const [message, setMessage] = useState(""); //""=String /
  const [files, setFiles] = useState([]); //[]=Array
  const [isUploading, setIsUploading] = useState(false);
  const [deletingFile, setDeletingFile] = useState("");
  const [imgPreviewUrl, setImgPreviewUrl] = useState(""); //to store the preview URL of the selected file
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false); //false=Boolean

  const fetchFiles = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/files`);
      const data = await response.json();
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files:", error);
      setMessage("Failed to load files.");
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []); //[] empty dependency array
  // []use -  run once when page loads <OR> []not use - always run when every render

  useEffect(() => {
    return () => {
      if (pdfPreviewUrl) {
        URL.revokeObjectURL(pdfPreviewUrl); //always clean preview URLs when changing file
      }
      if (imgPreviewUrl) {
        URL.revokeObjectURL(imgPreviewUrl);
      }
    };
  }, [pdfPreviewUrl, imgPreviewUrl]);

  const processFile = (file, inputElement = null) => {
    if (!file) return;

    if (imgPreviewUrl) {
      URL.revokeObjectURL(imgPreviewUrl);
      setImgPreviewUrl("");
    }

    if (pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl("");
    }

    const allowedExtensions = [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "webp",
      "pdf",
      "txt",
      "doc",
      "docx",
    ];

    const maxFileSize = 5 * 1024 * 1024; // 5 MB
    const extension = file.name.split(".").pop()?.toLowerCase();

    if (!extension || !allowedExtensions.includes(extension)) {
      setMessage(
        "File type not allowed. Allowed types: png, jpg, jpeg, gif, webp, pdf, txt, doc, docx",
      );
      setSelectedFile(null);
      setPdfPreviewUrl("");
      if (inputElement) inputElement.value = "";
      return;
    }

    if (file.size > maxFileSize) {
      setMessage("File is too large. Maximum size is 5 MB.");
      setSelectedFile(null);
      setPdfPreviewUrl("");
      if (inputElement) inputElement.value = "";
      return;
    }

    //check duplicate
    const isDuplicate = files.includes(file.name);
    if (isDuplicate) {
      setMessage("File already exists ❌");
      return;
    }

    setSelectedFile(file);
    setMessage("");

    //creates temporary local preview URL for image/PDF files so user can see preview before uploading
    if (file.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(file);  
      setImgPreviewUrl(objectUrl);
    } else {
      setImgPreviewUrl("");
    }

    if (file.type === "application/pdf") {
      const objectUrl = URL.createObjectURL(file);
      setPdfPreviewUrl(objectUrl);
    } else {
      setPdfPreviewUrl("");
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];
    processFile(file, event.target);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    processFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setMessage("Please select a file first.");
      return;
    }

    const formData = new FormData();  //files cannot be sent as JSON so must use FormData
    formData.append("file", selectedFile); // Send file to backend using FormData (required for file upload)

    try {
      setIsUploading(true);
      setMessage("");

      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setSelectedFile(null);
        setImgPreviewUrl("");
        setPdfPreviewUrl("");
        await fetchFiles();
      } else {
        setMessage(data.error || "Upload failed.");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setMessage("Something went wrong during upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (fileName) => {
    const confirmed = window.confirm(`Delete "${fileName}"?`);
    if (!confirmed) return;

    try {
      setDeletingFile(fileName);
      setMessage("");

      const response = await fetch(
        `${API_BASE_URL}/api/delete/${encodeURIComponent(fileName)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setImgPreviewUrl("");
        setPdfPreviewUrl("");
        await fetchFiles();
      } else {
        setMessage(data.error || "Delete failed.");
      }
    } catch (error) {
      console.error("Delete error:", error);
      setMessage("Something went wrong during delete.");
    } finally {
      setDeletingFile("");
    }
  };

  const getFileIcon = (filename) => {
    const lower = filename.toLowerCase();

    if (
      lower.endsWith(".png") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".gif") ||
      lower.endsWith(".webp")
    ) {
      return <ImageIcon className="w-5 h-5 text-pink-500" />;
    }

    if (
      lower.endsWith(".pdf") ||
      lower.endsWith(".doc") ||
      lower.endsWith(".docx")
    ) {
      return <FileText className="w-5 h-5 text-blue-500" />;
    }

    return <File className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="w-full min-h-screen bg-linear-to-br from-slate-100 via-gray-50 to-slate-200 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white/90 backdrop-blur-sm shadow-xl rounded-3xl border border-slate-200 overflow-hidden">
          <div className="px-8 pt-10 border-b border-slate-100">
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
              Mini File Upload App
            </h1>
          </div>

          <div className="px-8 py-8">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-2xl transition p-8 text-center ${
                isDragging
                  ? "border-blue-500 bg-blue-50"
                  : "border-slate-300 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              <p className="text-slate-500 mt-2 mb-5">
                Drag and drop a file here, or choose a file from your device.
              </p>

              {isDragging && (
                <p className="mt-3 mb-3 text-sm font-medium text-blue-600">
                  Drop your file here
                </p>
              )}

              <p className="py-3 mt-2 text-sm text-slate-500">
                Allowed: png, jpg, jpeg, gif, webp, pdf, txt, doc, docx • Max
                size: 5 MB
              </p>

              <label className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white border border-slate-300 shadow-sm cursor-pointer hover:bg-slate-50 transition font-medium text-slate-700">
                Choose File
                <input
                  id="fileInput"
                  type="file"
                  accept=".png,.jpg,.jpeg,.gif,.webp,.pdf,.txt,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <div className="mt-4 text-sm text-slate-600">
                {selectedFile ? (
                  <span>
                    Selected file:{" "}
                    <span className="font-semibold text-slate-800">
                      {selectedFile.name}
                    </span>
                  </span>
                ) : (
                  <span>No file selected yet</span>
                )}
              </div>

              {imgPreviewUrl && (
                <div className="mt-5">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    Image Preview
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm inline-block">
                    <img
                      src={imgPreviewUrl}
                      alt="Preview"
                      className="max-h-64 rounded-xl object-contain"
                    />
                  </div>
                </div>
              )}

              {pdfPreviewUrl && (
                <div className="mt-5 text-left">
                  <p className="text-sm font-medium text-slate-700 mb-2">
                    PDF Preview
                  </p>
                  <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
                    <iframe
                      src={pdfPreviewUrl}
                      title="PDF Preview"
                      className="w-full h-96 rounded-xl"
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="mt-6 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
              >
                <Upload className="w-5 h-5" />
                {isUploading ? "Uploading..." : "Upload File"}
              </button>

              {message && (
                <div className="mt-5 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium">
                  {message}
                </div>
              )}
            </div>

            <div className="mt-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-slate-900">
                  Uploaded Files
                </h2>
                <span className="text-sm text-slate-500">
                  {files.length} file{files.length !== 1 ? "s" : ""}
                </span>
              </div>

              {files.length === 0 ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500">
                  No files uploaded yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm hover:shadow-md transition"
                    >
                      <a
                        href={`${API_BASE_URL}/uploads/${file}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 min-w-0 flex-1 group"
                      >
                        <div className="shrink-0">{getFileIcon(file)}</div>
                        <div className="truncate">
                          <p className="truncate font-medium text-slate-800 group-hover:text-blue-600">
                            {file}
                          </p>
                          <p className="text-sm text-slate-500">
                            Click to open file
                          </p>
                        </div>
                      </a>

                      <button
                        onClick={() => handleDelete(file)}
                        disabled={deletingFile === file}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition"
                      >
                        <Trash2 className="w-4 h-4" />
                        {deletingFile === file ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
