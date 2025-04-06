import { Button } from "@/components/ui/button";
import { Code, Settings, Trash2,ChevronRight } from "lucide-react";

export const FileExplorer = ({ 
  files, 
  onSelectFile, 
  activeFile, 
  onToggleCollapse, 
  collapsed,
  darkMode,
  onDeleteFile,
  onSettingsOpen
}) => {
  return (
    <div className={`h-full ${collapsed ? 'w-0' : 'w-56'} flex flex-col ${darkMode ? 'border-gray-800 bg-[#111111]' : 'border-gray-200 bg-gray-50'} transition-all duration-200 overflow-hidden`}>
      {!collapsed && (
        <>
          <div className={`p-3 border-b ${darkMode ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between`}>
            <h2 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-800'}`}>EXPLORER</h2>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={onToggleCollapse}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            <div className="space-y-1">
              {files.map((file) => (
                <div key={file.id} className="flex items-center group">
                  <Button 
                    variant={activeFile === file.id ? "secondary" : "ghost"} 
                    size="sm" 
                    className="w-full justify-start flex-1"
                    onClick={() => onSelectFile(file)}
                  >
                    <Code className="mr-2 h-4 w-4" />
                    <span className="truncate">{file.name}</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onDeleteFile(file.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
          <div className={`p-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}`}>
            <Button 
              variant="ghost" 
              size="sm" 
              className="w-full justify-start"
              onClick={onSettingsOpen}
            >
              <Settings className="mr-2 h-4 w-4" />
              <span className={darkMode ? 'text-gray-300' : 'text-gray-800'}>Settings</span>
            </Button>
          </div>
        </>
      )}
    </div>
  );
};