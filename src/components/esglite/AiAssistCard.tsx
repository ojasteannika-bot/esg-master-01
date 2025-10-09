'use client';

type Props = { project: string; code: string };

export default function AiAssistCard({ project, code }: Props) {
  return (
    <div className="rounded-md border border-gray-200">
      <div className="border-b px-4 py-2">
        <h3 className="text-sm font-semibold">Help · AI assist</h3>
      </div>
      <div className="space-y-2 p-4 text-sm text-gray-700">
        <p>
          Kureeritud abi + AI assist lisandub siia. Praegu placeholder, et paigutus püsiks
          ja tulevased uuendused ei kustutaks paneeli uuesti ära.
        </p>
        <div className="text-xs text-gray-500">
          Context: <code>{project}</code> · <code>{code}</code>
        </div>
      </div>
    </div>
  );
}
