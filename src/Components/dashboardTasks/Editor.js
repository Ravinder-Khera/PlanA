import React, { useState } from "react";
import { EditorState, ContentState, convertFromHTML, convertToRaw } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import draftToHtml from "draftjs-to-html"; // Convert EditorState to HTML
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const EditorComponent = ({ content, onContentChange }) => {
  const initialHTML = content

  // Convert initial HTML into ContentState
  const blocksFromHTML = convertFromHTML(initialHTML);
  const contentState = ContentState.createFromBlockArray(blocksFromHTML.contentBlocks);
  const [editorState, setEditorState] = useState(EditorState.createWithContent(contentState));

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);  
    // Convert ContentState to raw format first
    const rawContentState = convertToRaw(newEditorState.getCurrentContent());
    const htmlContent = draftToHtml(rawContentState);
  
    onContentChange(htmlContent);
  };

  return (
    <div className="editor-container">
      <Editor
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        toolbarHidden={true} // ✅ Hides toolbar
        wrapperClassName="wrapperClassName"
        editorClassName="editor-class"
      />
    </div>
  );
};

export default EditorComponent;
