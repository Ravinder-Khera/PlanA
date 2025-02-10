import React, { useState, useRef } from "react";
import { EditorState } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

const EditorComponent = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const editorRef = useRef(null); // Ref to access the Editor component

  const onEditorStateChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleEditorClick = () => {
    setEditorState(EditorState.moveFocusToEnd(editorState)); // Auto-focus on click
  };

  return (
    <div className="editor-container" onClick={handleEditorClick}>
      <Editor
        ref={editorRef}
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
