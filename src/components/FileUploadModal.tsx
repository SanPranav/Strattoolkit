"use client";

import { toast } from "sonner";

import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
  DialogClose,
  DialogContent,
  DialogTitle
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Upload } from "lucide-react";

import { InputHTMLAttributes } from "react";

export default function FileUploadModal({
  children,
  label,
  accept,
  fileCallbackAction
}: {
  children?: React.ReactNode;
  label: string;
  accept?: InputHTMLAttributes<HTMLInputElement>["accept"];
  fileCallbackAction: (file: File) => void;
}) {
  const handleUpload = (e: React.FormEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files[0]) {
      fileCallbackAction(target.files[0]);
      return;
    }

    toast.error("Something went wrong :(");
  };

  return (
    <Dialog>
      <DialogTrigger asChild={!!children}>{children ?? label}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload an {label}</DialogTitle>
        </DialogHeader>
        <div className="grid w-full items-center justify-center gap-1.5 py-5">
          <Input
            type="file"
            id="file-upload"
            onInput={handleUpload}
            accept={accept}
            multiple={false}
            hidden
          />
          <Label
            htmlFor="file-upload"
            className="w-48 h-24 bg-muted flex flex-col items-center justify-center rounded-md border border-dashed">
            <Upload className="text-muted-foreground" />
            <p className="text-muted-foreground">Upload</p>
          </Label>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
