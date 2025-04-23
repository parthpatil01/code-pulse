import React, { useState, useEffect } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { DiffEditor } from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import {
  RotateCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Moon,
  Sun,
  Play,
  Terminal,
  Code,
  Settings,
  ChevronDown,
  ChevronRight,
  Save,
  FileInput,
  FileOutput,
  Plus,
  Trash2,
  Wand2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileExplorer } from "./FileExplorer";
import { SettingsModal } from "./SettingsModal";

const API_URL = import.meta.env.VITE_API_URL;

const languageTemplates = {
  javascript: `// JavaScript ES6
const greet = (name) => {
  return \`Hello, \${name}!\`;
};

console.log(greet("World"));`,
  python: `# Python 3
def greet(name):
    return f"Hello, {name}!"

print(greet("World"))`,
  java: `// Java
public class Main {
    public static void main(String[] args) {
        System.out.println(greet("World"));
    }
    
    public static String greet(String name) {
        return "Hello, " + name + "!";
    }
}`
};

const fileExtensions = {
  javascript: 'js',
  python: 'py',
  java: 'java'
};

const App = () => {
  const [files, setFiles] = useState([
    { id: '1', name: 'script.js', language: 'javascript', code: languageTemplates.javascript },
    { id: '2', name: 'app.py', language: 'python', code: languageTemplates.python },
    { id: '3', name: 'Main.java', language: 'java', code: languageTemplates.java }
  ]);
  const [activeFile, setActiveFile] = useState('1');
  const [code, setCode] = useState(languageTemplates.javascript);
  const [output, setOutput] = useState("// Output will appear here");
  const [language, setLanguage] = useState("javascript");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionId, setSubmissionId] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState("code");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const [wordWrap, setWordWrap] = useState(true);
  const [tabSize, setTabSize] = useState(2);
  const [refactoring, setRefactoring] = useState(false);
  const [diffView, setDiffView] = useState(false);
  const [originalCode, setOriginalCode] = useState("");
  const [refactoredCode, setRefactoredCode] = useState("");
  const [editorTheme, setEditorTheme] = useState("vs-dark");

  const currentFile = files.find(file => file.id === activeFile) || files[0];

  const editorOptions = {
    minimap: { enabled: true },
    fontSize: fontSize,
    wordWrap: wordWrap ? "on" : "off",
    tabSize: tabSize,
    automaticLayout: true,
    scrollBeyondLastLine: false,
    padding: { top: 10 },
    renderWhitespace: "selection",
    bracketPairColorization: { enabled: true },
    guides: { bracketPairs: true },
  };

  const diffEditorOptions = {
    ...editorOptions,
    readOnly: true,
    renderSideBySide: true,
    enableSplitViewResizing: true,
  };

  const statusConfig = {
    pending: {
      color: "text-amber-500",
      icon: <RotateCw className="animate-spin h-4 w-4" />,
      label: "Executing"
    },
    completed: {
      color: "text-emerald-500",
      icon: <CheckCircle className="h-4 w-4" />,
      label: "Success"
    },
    error: {
      color: "text-red-500",
      icon: <AlertCircle className="h-4 w-4" />,
      label: "Error"
    }
  };

  useEffect(() => {
    const savedSettings = localStorage.getItem('editorSettings');
    if (savedSettings) {
      const { fontSize, wordWrap, darkMode, tabSize } = JSON.parse(savedSettings);
      setFontSize(fontSize);
      setWordWrap(wordWrap);
      setDarkMode(darkMode);
      setTabSize(tabSize);
      setEditorTheme(darkMode ? "vs-dark" : "light");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('editorSettings', JSON.stringify({
      fontSize,
      wordWrap,
      darkMode,
      tabSize
    }));
    setEditorTheme(darkMode ? "vs-dark" : "light");
  }, [fontSize, wordWrap, darkMode, tabSize]);

  useEffect(() => {
    let intervalId;

    if (submissionId && submissionStatus !== 'completed' && submissionStatus !== 'error') {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${API_URL}/status/${submissionId}`);
          const data = response.data;

          setSubmissionStatus(data.status);

          if (data.status === 'completed' || data.status === 'error') {
            setOutput(data.output || "// No output available");
            setIsSubmitting(false);
            clearInterval(intervalId);
          }
        } catch (error) {
          console.error("Error checking status:", error);
        }
      }, 2000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [submissionId, submissionStatus]);

  useEffect(() => {
    if (currentFile) {
      setCode(currentFile.code);
      setLanguage(currentFile.language);
    }
  }, [currentFile]);

  const handleRunCode = async () => {
    setIsSubmitting(true);
    setOutput("// Submitting code...");
    setSubmissionId(null);
    setSubmissionStatus(null);

    try {
      const response = await axios.post(`${API_URL}/run`, {
        code,
        language,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data;

      if (data.submissionId) {
        setSubmissionId(data.submissionId);
        setSubmissionStatus('pending');
        setOutput("// Code submitted. Waiting for execution...");
      } else {
        setOutput(data.output || "// Error submitting code");
        setIsSubmitting(false);
      }
    } catch (error) {
      setOutput(`// Server error: ${error.message}`);
      setIsSubmitting(false);
    }
  };

  const handleRefactorCode = async () => {
    setRefactoring(true);
    setOutput("// Refactoring code...");

    try {
      const response = await axios.post(`${API_URL}/refactor`, {
        code,
        language,
      }, {
        headers: { "Content-Type": "application/json" },
      });

      const data = response.data;

      if (data.refactoredCode) {
        console.log(data);
        setOriginalCode(data.originalCode);
        setRefactoredCode(data.refactoredCode);
        setDiffView(true);
        setActiveTab("code");
        setOutput("// Refactoring completed. Review changes above.");
      } else {
        setOutput("// No refactored code received");
      }
    } catch (error) {
      setOutput(`// Refactoring error: ${error.message}`);
    } finally {
      setRefactoring(false);
    }
  };

  const applyRefactoredCode = () => {
    setCode(refactoredCode);
    updateCurrentFile({ code: refactoredCode });
    setDiffView(false);
    setOutput("// Refactored code applied successfully.");
  };

  const cancelRefactor = () => {
    setDiffView(false);
    setOutput("// Refactoring cancelled.");
  };

  const updateCurrentFile = (updates) => {
    setFiles(files.map(file =>
      file.id === activeFile ? { ...file, ...updates } : file
    ));
  };

  const handleLanguageChange = (value) => {
    setLanguage(value);
    updateCurrentFile({ language: value });
  };

  const handleNewFile = () => {
    const newId = Date.now().toString();
    const newFile = {
      id: newId,
      name: `new.${fileExtensions[language]}`,
      language,
      code: languageTemplates[language] || ""
    };

    setFiles([...files, newFile]);
    setActiveFile(newId);
  };

  const handleSaveFile = () => {
    updateCurrentFile({ code });
  };

  const handleSaveAs = () => {
    const newName = prompt("Enter new file name:", currentFile.name);
    if (newName) {
      const newId = Date.now().toString();
      const newFile = {
        id: newId,
        name: newName,
        language: currentFile.language,
        code: currentFile.code
      };

      setFiles([...files, newFile]);
      setActiveFile(newId);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target.result;
      const extension = file.name.split('.').pop();
      let fileLanguage = 'javascript';

      if (extension === 'py') fileLanguage = 'python';
      if (extension === 'java') fileLanguage = 'java';

      const newId = Date.now().toString();
      const newFile = {
        id: newId,
        name: file.name,
        language: fileLanguage,
        code: content
      };

      setFiles([...files, newFile]);
      setActiveFile(newId);
    };
    reader.readAsText(file);
  };

  const handleExportFile = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDeleteFile = (fileId) => {
    if (files.length <= 1) {
      alert("You must have at least one file");
      return;
    }

    if (window.confirm("Are you sure you want to delete this file?")) {
      const newFiles = files.filter(file => file.id !== fileId);
      setFiles(newFiles);

      if (fileId === activeFile) {
        setActiveFile(newFiles[0].id);
      }
    }
  };

  const handleSelectFile = (file) => {
    if (file.id !== activeFile) {
      updateCurrentFile({ code });
      setActiveFile(file.id);
    }
  };

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-white text-gray-900'}`}>
      <header className={`flex items-center justify-between p-3 border-b ${darkMode ? 'border-gray-800 bg-[#111111]' : 'border-gray-200 bg-gray-50'}`}>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Code className="h-5 w-5 text-blue-500" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
              CodePulse
            </h1>
          </div>

          <div className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNewFile}
              className="text-sm"
            >
              <Plus className="mr-2 h-4 w-4" /> New
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-sm">
                  File <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-48">
                <DropdownMenuItem onClick={handleSaveFile}>
                  <Save className="mr-2 h-4 w-4" /> Save
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSaveAs}>
                  <Save className="mr-2 h-4 w-4" /> Save As
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <label className="flex items-center cursor-pointer w-full">
                    <FileInput className="mr-4 h-4 w-4" /> Import
                    <input
                      type="file"
                      className="hidden"
                      onChange={handleImportFile}
                      accept=".js,.py,.java"
                    />
                  </label>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportFile}>
                  <FileOutput className="mr-2 h-4 w-4" /> Export
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2">
            <Label htmlFor="language-select" className="text-sm text-muted-foreground">
              Language:
            </Label>
            <Select value={language} onValueChange={handleLanguageChange} disabled={isSubmitting}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="java">Java</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setDarkMode(!darkMode)}
                className="hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {darkMode ? 'Light mode' : 'Dark mode'}
            </TooltipContent>
          </Tooltip>

          <Button
            onClick={handleRefactorCode}
            disabled={isSubmitting || refactoring}
            variant="ghost"
            className={`px-4 ${darkMode ? 'hover:bg-gray-700 hover:text-white ' : 'hover:bg-gray-200'} cursor-pointer`}
          >
            {refactoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refactoring
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Refactor
              </>
            )}
          </Button>

          <Button
            onClick={handleRunCode}
            disabled={isSubmitting || refactoring}
            className="px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white hover:cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Run
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <FileExplorer
          files={files}
          onSelectFile={handleSelectFile}
          activeFile={activeFile}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          collapsed={sidebarCollapsed}
          darkMode={darkMode}
          onDeleteFile={handleDeleteFile}
          onSettingsOpen={() => setSettingsOpen(true)}
        />

        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className={`rounded-md ${darkMode ? 'bg-[#111111]' : 'bg-gray-50'}`}>
              <TabsTrigger value="code" className={`flex items-center ${darkMode ? activeTab!='output' ?'text-black':'text-white' : 'text-black'}`}>
                <Code className="mr-2 h-4 w-4" />
                {currentFile?.name}
              </TabsTrigger>
              <TabsTrigger value="output" className={`flex items-center ${darkMode ? activeTab=='output' ?'text-black':'text-white' : 'text-black'}`}>
                <Terminal className="mr-2 h-4 w-4" />
                Output
              </TabsTrigger>
            </TabsList>

            {/* Replace your current TabsContent for "code" with this */}
            <TabsContent value="code" className="flex-1 overflow-hidden m-0">
              {diffView ? (
                <div className="flex flex-col h-full">
                  <div className={`flex justify-between items-center p-2 border-b ${darkMode ? 'border-gray-700 bg-[#1e1e1e]' : 'border-gray-200 bg-gray-100'}`}>
                    <div className="text-sm font-mono">
                      <span className="text-green-500">Original</span> → <span className="text-blue-500">Refactored</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelRefactor}
                        className="h-8 text-black hover:cursor-pointer hover:bg-gray-200"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={applyRefactoredCode}
                        className="h-8 bg-green-600 hover:bg-green-700 text-white"
                      >
                        Apply Changes
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1" key={`diff-${Date.now()}`}>
                    <DiffEditor
                      height="100%"
                      originalLanguage={language}
                      modifiedLanguage={language}
                      original={originalCode}
                      modified={refactoredCode}
                      theme={darkMode ? "vs-dark" : "light"}
                      options={{
                        ...diffEditorOptions,
                        renderSideBySide: true,
                        originalEditable: false,
                        readOnly: false,
                        automaticLayout: true,
                      }}
                      beforeMount={(monaco) => {
                        monaco.editor.defineTheme('custom-dark', {
                          base: 'vs-dark',
                          inherit: true,
                          rules: [],
                          colors: {
                            'editor.background': '#0a0a0a',
                            'minimap.background': '#111111',
                          }
                        });
                      }}
                    />
                  </div>
                </div>
              ) : (
                <Editor
                  height="100%"
                  language={language}
                  value={code}
                  onChange={(value) => setCode(value || "")}
                  theme={darkMode ? "vs-dark" : "light"}
                  options={editorOptions}
                  beforeMount={(monaco) => {
                    monaco.editor.defineTheme('custom-dark', {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [],
                      colors: {
                        'editor.background': '#0a0a0a',
                        'editor.lineHighlightBackground': '#111111',
                        'editorLineNumber.foreground': '#555555',
                      }
                    });
                  }}
                />
              )}
            </TabsContent>

            <TabsContent value="output" className="flex-1 overflow-auto m-0">
              <div className={`h-full p-4 font-mono text-sm ${darkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
                {output.split('\n').map((line, i) => (
                  <div key={i} className={`whitespace-pre-wrap ${line.startsWith('//') ? 'text-gray-500' : ''}`}>
                    {line}
                    {i < output.split('\n').length - 1 && <br />}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>

          <div className={`flex items-center justify-between px-3 py-1 text-xs ${darkMode ? 'bg-[#111111] border-t border-gray-800 text-gray-400' : 'bg-gray-100 border-t border-gray-200 text-gray-600'}`}>
            <div className="flex items-center space-x-4">
              {submissionStatus && (
                <div className={`flex items-center ${statusConfig[submissionStatus]?.color || 'text-gray-500'}`}>
                  {statusConfig[submissionStatus]?.icon}
                  <span className="ml-1">{statusConfig[submissionStatus]?.label}</span>
                </div>
              )}
              {refactoring && (
                <div className="flex items-center text-amber-500">
                  <Loader2 className="animate-spin h-4 w-4 mr-1" />
                  <span>Refactoring</span>
                </div>
              )}
              <span>Ln {code.split('\n').length}, Col {code.length > 0 ? code.split('\n').pop().length : 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>{language.toUpperCase()}</span>
              <span>UTF-8</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        fontSize={fontSize}
        setFontSize={setFontSize}
        wordWrap={wordWrap}
        setWordWrap={setWordWrap}
        tabSize={tabSize}
        setTabSize={setTabSize}
      />
    </div>
  );
};

export default App;