export const Icon = ({ name, size = 24, style = {} }) => {
  const props = { viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round", strokeLinejoin: "round", width: size, height: size, style };
  const icons = {
    shield: <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
    leaf:   <svg {...props}><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/></svg>,
    bus:    <svg {...props}><path d="M8 6v6"/><path d="M15 6v6"/><path d="M2 12h19.6"/><path d="M18 18h3s.5-1.7.8-2.8c.1-.4.2-.8.2-1.2 0-.4-.1-.8-.2-1.2l-1.4-5C20.1 6.8 19.1 6 18 6H4a2 2 0 0 0-2 2v10h3"/><circle cx="7" cy="18" r="2"/><path d="M9 18h5"/><circle cx="16" cy="18" r="2"/></svg>,
    bicycle:<svg {...props}><circle cx="18.5" cy="17.5" r="3.5"/><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="15" cy="5" r="1"/><path d="M12 17.5V14l-3-3 4-3 2 3h2"/></svg>,
    plus:   <svg {...props}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    minus:  <svg {...props}><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    coins:  <svg {...props}><circle cx="9" cy="12" r="6"/><path d="M15 6a6 6 0 0 1 0 12"/><path d="M9 9v2h2"/><path d="M7 13h4"/></svg>,
    gauge:  <svg {...props}><path d="M12 20a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"/><path d="M12 12l3-3"/><circle cx="12" cy="12" r="1"/></svg>,
    book:   <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z"/></svg>,
    home:   <svg {...props}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
    handshake: <svg {...props}><path d="M11 17l-1.5 1.5a2.12 2.12 0 0 1-3 0L4 16"/><path d="M20 8l-3.5-3.5a2.12 2.12 0 0 0-3 0L7 11"/><path d="M4 8l3.5-3.5a2.12 2.12 0 0 1 3 0L17 11"/><path d="M20 16l-2.5 2.5a2.12 2.12 0 0 1-3 0L13 17"/><line x1="6" y1="14" x2="10" y2="10"/><line x1="14" y1="14" x2="18" y2="10"/></svg>,
    eye:    <svg {...props}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  };
  return icons[name] || null;
};
