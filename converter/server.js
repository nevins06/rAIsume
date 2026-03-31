// ============================================================
// HTML → DOCX Converter Microservice
// Accepts POST /convert with { html: "..." }
// Returns a .docx binary file
// ============================================================

const express = require('express');
const cors = require('cors');
const HTMLtoDOCX = require('html-to-docx');

const app = express();
const PORT = 3456;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'html-to-docx-converter' });
});

// Convert HTML → DOCX
app.post('/convert', async (req, res) => {
  try {
    const { html } = req.body;

    if (!html || typeof html !== 'string') {
      return res.status(400).json({
        error: 'Missing or invalid "html" field in request body',
      });
    }

    console.log(`[${new Date().toISOString()}] Converting HTML (${html.length} chars) → DOCX`);

    // Extract just the body content if it's a full HTML doc
    // html-to-docx expects the HTML content (it wraps it internally)
    let bodyContent = html;
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      bodyContent = bodyMatch[1];
    }

    // Extract any inline styles from the head for the header
    let headerHtml = '';
    const styleMatch = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatch) {
      headerHtml = styleMatch.join('\n');
    }

    // Convert HTML to DOCX buffer
    const docxBuffer = await HTMLtoDOCX(bodyContent, headerHtml, {
      table: { row: { cantSplit: true } },
      footer: false,
      pageNumber: false,
      font: 'Calibri',
      fontSize: 22, // half-points, so 22 = 11pt
      margins: {
        top: 720,    // 0.5 inch in twips
        right: 720,
        bottom: 720,
        left: 720,
      },
    });

    // Set response headers for file download
    res.set({
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': 'attachment; filename="resume.docx"',
      'Content-Length': docxBuffer.byteLength,
    });

    res.send(Buffer.from(docxBuffer));

    console.log(`[${new Date().toISOString()}] ✅ DOCX generated and sent (${docxBuffer.byteLength} bytes)`);

  } catch (err) {
    console.error('❌ Conversion error:', err.message);
    res.status(500).json({ error: 'Failed to convert HTML to DOCX', details: err.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🔧 HTML→DOCX Converter running on http://localhost:${PORT}`);
  console.log(`   POST /convert  — send { html: "<your html>" }`);
  console.log(`   GET  /health   — health check\n`);
});
