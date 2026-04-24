import React from "react";
import { QRCodeCanvas } from "qrcode.react";
import { PUBLIC_BASE_URL } from "./config";

export function getVerifyURL(certId) {
  return `${PUBLIC_BASE_URL}/verify?id=${certId}`;
}

export function VerifyQRCode({ certId, size = 72 }) {
  return <QRCodeCanvas value={getVerifyURL(certId)} size={size} includeMargin />;
}
