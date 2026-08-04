import { Download, FileText } from "lucide-react";
import { useEffect, useMemo } from "react";
import { Button, Modal } from "../../components/ui/index.js";
import { base64DocumentBlob } from "../../services/firebase/paymentDocuments.js";

export default function DocumentPreviewModal({ document, onClose }) {
  const url = useMemo(() => {
    if (!document) return "";
    if (document.url) return document.url;
    return URL.createObjectURL(base64DocumentBlob(document));
  }, [document]);

  useEffect(() => {
    if (!url || document?.url) return undefined;
    return () => URL.revokeObjectURL(url);
  }, [document?.url, url]);

  const isImage = String(document?.contentType || "").startsWith("image/");
  return (
    <Modal
      open={Boolean(document)}
      className="modal--financial-document"
      title={document?.filename || document?.fileName || "Dokumendi eelvaade"}
      onClose={onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Sulge</Button>
          {url ? (
            <a
              className="button button--primary"
              href={url}
              download={document?.filename || document?.fileName || "document"}
            >
              <Download size={17} /> Laadi alla
            </a>
          ) : null}
        </>
      }
    >
      {url ? (
        <div className="financial-document-preview">
          {isImage ? (
            <img src={url} alt={document?.filename || document?.fileName || "Maksedokument"} />
          ) : (
            <iframe src={url} title={document?.filename || document?.fileName || "Finantsdokument"} />
          )}
        </div>
      ) : (
        <div className="document-loading"><FileText size={24} /> Valmistan eelvaadet…</div>
      )}
    </Modal>
  );
}
