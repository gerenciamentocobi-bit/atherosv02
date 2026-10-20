import { draftMode } from 'next/headers';
import { VisualEditing } from 'next-sanity/visual-editing';

/** Renderiza o overlay do Presentation Tool e um aviso apenas em modo rascunho. */
export default async function DraftPreview() {
  const { isEnabled } = await draftMode();
  if (!isEnabled) return null;
  return (
    <>
      <VisualEditing />
      <a
        href="/api/draft-mode/disable"
        style={{
          position: 'fixed', bottom: 16, left: 16, zIndex: 9999,
          background: '#111', color: '#fff', padding: '8px 14px',
          borderRadius: 8, fontSize: 13, textDecoration: 'none',
        }}
      >
        Modo rascunho ativo — sair
      </a>
    </>
  );
}
