import React, { forwardRef } from "react";
import { Link } from "react-router-dom";

const Footer = forwardRef(function Footer(props, ref) {
  return (
    <footer
      ref={ref}
      style={{
        background: "#222",
        color: "#cab964",
        padding: "32px 0 16px 0",
        textAlign: "center",
        borderTop: "2px solid #444",
        marginTop: "32px"
      }}
      {...props}
    >
      <div style={{
        maxWidth: 1100,
        margin: "0 auto",
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "flex-start",
        padding: "0 24px"
      }}>
        {/* Logo & Brand */}
        <div style={{ flex: "1 1 180px", textAlign: "left", marginBottom: 16 }}>
          <span style={{
            fontWeight: "bold",
            fontSize: 24,
            letterSpacing: 1,
            color: "#265B63"
          }}>
            Dynamic Workspace
          </span>
          <div style={{ fontSize: 14, color: "#cab964", marginTop: 8 }}>
            Virtual collaboration made real.
          </div>
        </div>

        {/* Links */}
        <div style={{ flex: "1 1 120px", marginBottom: 16 }}>
          <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Links</div>
          <Link to="/home" style={footerLink}>Home</Link>
        </div>

        {/* Socials */}
        <div style={{ flex: "1 1 120px", marginBottom: 16 }}>
          <div style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>Connect</div>
          <a href="https://twitter.com/" style={footerLink} target="_blank" rel="noopener noreferrer">Twitter</a><br />
          <a href="https://github.com/" style={footerLink} target="_blank" rel="noopener noreferrer">GitHub</a><br />
          <a href="mailto:hello@example.com" style={footerLink}>Email</a>
        </div>
      </div>
      <div style={{
        borderTop: "1px solid #333",
        marginTop: 24,
        paddingTop: 12,
        fontSize: 13,
        color: "#cab964"
      }}>
        &copy; {new Date().getFullYear()} Dynamic Workspace. All rights reserved.
      </div>
    </footer>
  );
});

export default Footer;

const footerLink = {
  color: "#265B63",
  textDecoration: "none",
  fontSize: 15,
  margin: "2px 0",
  transition: "color 0.2s"
};
