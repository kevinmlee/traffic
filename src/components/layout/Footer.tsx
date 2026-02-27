export function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-bg-base)',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          flexWrap: 'wrap',
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
        }}
      >
        <span>
          Camera data from{' '}
          <a
            href="https://cwwp2.dot.ca.gov"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-brand-500)', textDecoration: 'none' }}
          >
            Caltrans CWWP2
          </a>
        </span>
        <span>
          Map ©{' '}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-brand-500)', textDecoration: 'none' }}
          >
            OpenStreetMap
          </a>{' '}
          contributors,{' '}
          <a
            href="https://carto.com/attributions"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'var(--color-brand-500)', textDecoration: 'none' }}
          >
            CARTO
          </a>
        </span>
      </div>
    </footer>
  );
}
