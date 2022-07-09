import { RequestHandler } from "express";

export const checkHeader: (headers: Record<string, string>) => RequestHandler =
  (headers) => (req, res, next) => {
    let hasHeaders = true;
    for (const header in headers) {
      const headerValue = headers[header];
      if (req.headers[header.toLowerCase()] !== headerValue) {
        hasHeaders = false;
      }
    }

    if (!hasHeaders) {
      res.status(404).end();
      return;
    }

    next();
  };

export const checkContentTypeHeader: (contentType: string) => RequestHandler =
  (contentType) => (req, res, next) => {
    return checkHeader({
      "Content-Type": contentType,
    })(req, res, next);
  };
