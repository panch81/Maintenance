import React from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder, className = "", onImagePaste }) => {
    const modules = {
        toolbar: [
            [{ 'header': [1, 2, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link', 'clean']
        ],
    };

    const formats = [
        'header',
        'bold', 'italic', 'underline', 'strike',
        'list', 'bullet',
        'link'
    ];

    const handlePaste = (e) => {
        console.log('[Editor] Paste event detected');
        const items = e.clipboardData?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    console.log('[Editor] Image found in clipboard!');
                    if (onImagePaste) onImagePaste(e);
                    return;
                }
            }
        }
    };

    return (
        <div className={`rich-text-wrapper ${className}`}>
            <div onPaste={handlePaste}>
                <ReactQuill
                    theme="snow"
                    value={value || ''}
                    onChange={onChange}
                    modules={modules}
                    formats={formats}
                    placeholder={placeholder}
                />
            </div>
        </div>
    );
};

export default RichTextEditor;
