import React from "react";
import { QRCodeCanvas } from "qrcode.react";

export function getVerifyURL(certId) {
  return `https://interntech.in/verify?id=${certId}`;
}

export function VerifyQRCode({ certId, size = 72 }) {
  return <QRCodeCanvas value={getVerifyURL(certId)} size={size} includeMargin />;
}
