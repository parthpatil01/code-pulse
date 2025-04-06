import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
  } from "@/components/ui/dialog"
  import { Label } from "@/components/ui/label"
  import { Switch } from "@/components/ui/switch"
  import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
  
  export const SettingsModal = ({ 
    open, 
    onOpenChange, 
    darkMode, 
    setDarkMode,
    fontSize,
    setFontSize,
    wordWrap,
    setWordWrap,
    tabSize,
    setTabSize
  }) => {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editor Settings</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
              </Label>
              <Switch
                id="dark-mode"
                checked={darkMode}
                onCheckedChange={setDarkMode}
              />
            </div>
            
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="font-size" className="flex flex-col space-y-1">
                <span>Font Size</span>
              </Label>
              <Select value={fontSize.toString()} onValueChange={(value) => setFontSize(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Font Size" />
                </SelectTrigger>
                <SelectContent>
                  {[12, 14, 16, 18, 20].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}px
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="word-wrap" className="flex flex-col space-y-1">
                <span>Word Wrap</span>
              </Label>
              <Switch
                id="word-wrap"
                checked={wordWrap}
                onCheckedChange={setWordWrap}
              />
            </div>
  
            <div className="flex items-center justify-between space-x-4">
              <Label htmlFor="tab-size" className="flex flex-col space-y-1">
                <span>Tab Size</span>
              </Label>
              <Select value={tabSize.toString()} onValueChange={(value) => setTabSize(parseInt(value))}>
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Tab Size" />
                </SelectTrigger>
                <SelectContent>
                  {[2, 4, 6, 8].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} spaces
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  };