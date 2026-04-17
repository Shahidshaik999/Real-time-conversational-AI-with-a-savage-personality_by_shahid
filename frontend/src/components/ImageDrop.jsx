import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageDrop({ onImage, disabled }) {
  const [dragging, setDragging] = useState(false);
  const [preview,  setPreview]  = useState(null);

  const processFile = useCallback((file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      onImage(e.target.result, file.name);
    };
    reader.readAsDataURL(file);
  }, [onImage]);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    processFile(e.dataTransfer.files[0]);
  }, [processFile]);

  const onFileInput = (e) => processFile(e.target.files[0]);

  return (
    <div
      className={`image-drop ${dragging ? "dragging" : ""} ${disabled ? "disabled" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
    >
      <AnimatePresence>
        {preview ? (
          <motion.div className="image-preview-wrap" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <img src={preview} alt="uploaded" className="image-preview" />
            <button className="image-clear" onClick={() => setPreview(null)} title="Remove image">✕</button>
          </motion.div>
        ) : (
          <motion.label className="image-drop-label" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>Drop image or click to upload</span>
            <input type="file" accept="image/*" onChange={onFileInput} style={{ display: "none" }} disabled={disabled} />
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
}
