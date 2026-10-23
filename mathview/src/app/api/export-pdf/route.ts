import { NextRequest, NextResponse } from "next/server";

interface ExportPdfRequest {
  html: string;
  dimensions: {
    pageWidth: number;
    pageHeight: number;
    marginTop: number;
    marginRight: number;
    marginBottom: number;
    marginLeft: number;
  };
}

export async function POST(request: NextRequest) {
  const apiKey = process.env.BROWSERLESS_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "PDF export is not configured. Missing BROWSERLESS_API_KEY." },
      { status: 500 }
    );
  }

  let body: ExportPdfRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }

  const { html, dimensions } = body;

  if (!html || !dimensions) {
    return NextResponse.json(
      { error: "Missing required fields: html and dimensions" },
      { status: 400 }
    );
  }

  try {
    // Call Browserless PDF API
    // https://docs.browserless.io/rest-apis/pdf
    const response = await fetch(
      `https://production-sfo.browserless.io/pdf?token=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          emulateMediaType: "screen",
          options: {
            displayHeaderFooter: false,
            printBackground: true,
            width: `${dimensions.pageWidth}px`,
            height: `${dimensions.pageHeight}px`,
            margin: { top: "0px", right: "0px", bottom: "0px", left: "0px" },
            waitForFonts: true,
            preferCSSPageSize: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Browserless API error:", response.status, errorText);
      return NextResponse.json(
        { error: "Failed to generate PDF" },
        { status: 502 }
      );
    }

    const pdfBuffer = await response.arrayBuffer();

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="mathview-export.pdf"',
      },
    });
  } catch (error) {
    console.error("PDF export error:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}
