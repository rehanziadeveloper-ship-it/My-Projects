const fs = require('fs');
const path = require('path');
const https = require('https');

const SPREADSHEET_ID = '1Rpb9XQsymoDDSEl0n1EChgi8KY7BgmajFXctwreAMjo';
const N8N_URL = 'n8n.srv1767318.hstgr.cloud';
const N8N_API_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2NGM3OGY4NC1jNTk2LTRiNjktYmViYi1kN2VhYWYwNTdkY2EiLCJpc3MiOiJuOG4iLCJqdGkiOiIwMmVhZTI5Yi01ZWIwLTRmMTItYjYwNi0zYmNhMjEwZjNjNmUiLCJpYXQiOjE3OTI1MTQ0MzksImF1ZCI6InB1YmxpYy1hcGkifQ.pmgL2gbP_mqyTEeF4IIul0972a0wGl4YnH1L9zpUqt8';

const engineCode = fs.readFileSync(path.join(__dirname, 'intelligence-engine.js'), 'utf8');

const n8nBrainCode = `
${engineCode}

const input = $json.body || $json;
const transcript = input.transcript || input.rawTranscript || input.text || '';
const metadata = {
  id: input.id || input.callId || ('CALL-' + Math.floor(100 + Math.random() * 900)),
  callerName: input.callerName || '',
  phoneNumber: input.phoneNumber || input.phone || '',
  company: input.company || '',
  callType: input.callType || '',
  duration: input.duration || '3m 00s'
};

const result = analyzeCallTranscript(transcript, metadata);

// Prepare Clean Google Sheets Row Data
const rawPhone = result.metadata.phoneNumber || '';
const safePhone = rawPhone.startsWith('+') ? ("'" + rawPhone) : rawPhone;

const sheetsRow = {
  Call_ID: result.callId,
  Date_Time: result.metadata.analyzedAt,
  Caller_Name: result.metadata.callerName,
  Phone_Number: safePhone,
  Call_Type: result.metadata.callType,
  Duration: result.metadata.duration,
  Urgency_Level: result.intelligence.urgencyLevel,
  Sentiment: result.intelligence.sentiment,
  Sentiment_Score: String(result.intelligence.sentimentScore),
  Executive_Summary_TLDR: result.intelligence.executiveSummary.join(' | '),
  Action_Items: result.intelligence.actionItems.map(a => a.task + ' (' + a.assignee + ')').join('; '),
  Key_Objections_or_Risks: result.intelligence.objections.map(o => o.tag + ': ' + o.detail).join('; ')
};

return [{
  json: {
    ...result,
    sheetsRow
  }
}];
`;

const workflow = {
  name: "Day 7 - Post-Call Intelligence Pipeline (Audio Summarizer + Sentiment & Urgency Dispatch)",
  nodes: [
    {
      id: "webhook-call-ingest",
      name: "Call_Ingest_Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 2,
      position: [100, 300],
      parameters: {
        httpMethod: "POST",
        path: "post-call-intelligence",
        responseMode: "responseNode",
        options: {}
      }
    },
    {
      id: "ai-intelligence-analyzer",
      name: "AI_Intelligence_Analyzer",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [340, 300],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: n8nBrainCode
      }
    },
    {
      id: "switch-urgency",
      name: "Check_Urgency_Level",
      type: "n8n-nodes-base.switch",
      typeVersion: 3.2,
      position: [580, 300],
      parameters: {
        mode: "rules",
        rules: {
          values: [
            {
              conditions: {
                options: { caseSensitive: false, leftValue: "", typeValidation: "loose", version: 1 },
                conditions: [
                  {
                    leftValue: "={{ $json.intelligence.urgencyLevel }}",
                    rightValue: "P0",
                    operator: { type: "string", operation: "contains" }
                  }
                ]
              }
            },
            {
              conditions: {
                options: { caseSensitive: false, leftValue: "", typeValidation: "loose", version: 1 },
                conditions: [
                  {
                    leftValue: "={{ $json.intelligence.urgencyLevel }}",
                    rightValue: "P1",
                    operator: { type: "string", operation: "contains" }
                  }
                ]
              }
            }
          ]
        },
        options: {
          fallbackOutput: 2
        }
      }
    },
    {
      id: "format-p0-dispatch",
      name: "Format_P0_Critical_Dispatch",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [820, 180],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: `const item = $json;
return [{
  json: {
    alertChannel: "SLACK_VIP_AND_WHATSAPP_EMERGENCY",
    alertPriority: "P0_IMMEDIATE_DISPATCH",
    alertText: item.dispatchCard,
    ...item
  }
}];`
      }
    },
    {
      id: "format-standard-dispatch",
      name: "Format_Standard_Dispatch",
      type: "n8n-nodes-base.code",
      typeVersion: 2,
      position: [820, 380],
      parameters: {
        mode: "runOnceForAllItems",
        jsCode: `const item = $json;
return [{
  json: {
    alertChannel: "SLACK_CLIENT_DISPATCH",
    alertPriority: "STANDARD_PROCESSING",
    alertText: item.dispatchCard,
    ...item
  }
}];`
      }
    },
    {
      id: "append-sheets-log",
      name: "Append_Call_Intelligence_Log",
      type: "n8n-nodes-base.googleSheets",
      typeVersion: 4.5,
      onError: "continueRegularOutput",
      position: [1060, 300],
      parameters: {
        authentication: "serviceAccount",
        operation: "append",
        documentId: {
          __rl: true,
          mode: "id",
          value: SPREADSHEET_ID
        },
        sheetName: {
          __rl: true,
          mode: "name",
          value: "Call_Intelligence_Logs"
        },
        columns: {
          mappingMode: "defineBelow",
          value: {
            "Call_ID": "={{ $json.sheetsRow.Call_ID }}",
            "Date_Time": "={{ $json.sheetsRow.Date_Time }}",
            "Caller_Name": "={{ $json.sheetsRow.Caller_Name }}",
            "Phone_Number": "={{ $json.sheetsRow.Phone_Number }}",
            "Call_Type": "={{ $json.sheetsRow.Call_Type }}",
            "Duration": "={{ $json.sheetsRow.Duration }}",
            "Urgency_Level": "={{ $json.sheetsRow.Urgency_Level }}",
            "Sentiment": "={{ $json.sheetsRow.Sentiment }}",
            "Sentiment_Score": "={{ $json.sheetsRow.Sentiment_Score }}",
            "Executive_Summary_TLDR": "={{ $json.sheetsRow.Executive_Summary_TLDR }}",
            "Action_Items": "={{ $json.sheetsRow.Action_Items }}",
            "Key_Objections_or_Risks": "={{ $json.sheetsRow.Key_Objections_or_Risks }}"
          },
          matchingColumns: [],
          schema: [
            { id: "Call_ID", displayName: "Call_ID", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Date_Time", displayName: "Date_Time", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Caller_Name", displayName: "Caller_Name", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Phone_Number", displayName: "Phone_Number", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Call_Type", displayName: "Call_Type", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Duration", displayName: "Duration", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Urgency_Level", displayName: "Urgency_Level", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Sentiment", displayName: "Sentiment", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Sentiment_Score", displayName: "Sentiment_Score", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Executive_Summary_TLDR", displayName: "Executive_Summary_TLDR", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Action_Items", displayName: "Action_Items", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true },
            { id: "Key_Objections_or_Risks", displayName: "Key_Objections_or_Risks", required: false, defaultMatch: false, display: true, type: "string", canBeUsedToMatch: true }
          ]
        },
        options: {
          valueInputMode: "USER_ENTERED"
        }
      },
      credentials: {
        googleApi: {
          id: "AqyKDLuwANoDYrEw",
          name: "Google Service Account"
        }
      }
    },
    {
      id: "respond-webhook",
      name: "Respond_To_Webhook",
      type: "n8n-nodes-base.respondToWebhook",
      typeVersion: 1.1,
      position: [1280, 300],
      parameters: {
        options: {},
        respondWith: "json",
        responseBody: "={{ JSON.stringify($('AI_Intelligence_Analyzer').first().json) }}"
      }
    }
  ],
  connections: {
    "Call_Ingest_Webhook": {
      main: [
        [{ node: "AI_Intelligence_Analyzer", type: "main", index: 0 }]
      ]
    },
    "AI_Intelligence_Analyzer": {
      main: [
        [{ node: "Check_Urgency_Level", type: "main", index: 0 }]
      ]
    },
    "Check_Urgency_Level": {
      main: [
        [{ node: "Format_P0_Critical_Dispatch", type: "main", index: 0 }],
        [{ node: "Format_Standard_Dispatch", type: "main", index: 0 }],
        [{ node: "Format_Standard_Dispatch", type: "main", index: 0 }]
      ]
    },
    "Format_P0_Critical_Dispatch": {
      main: [
        [{ node: "Append_Call_Intelligence_Log", type: "main", index: 0 }]
      ]
    },
    "Format_Standard_Dispatch": {
      main: [
        [{ node: "Append_Call_Intelligence_Log", type: "main", index: 0 }]
      ]
    },
    "Append_Call_Intelligence_Log": {
      main: [
        [{ node: "Respond_To_Webhook", type: "main", index: 0 }]
      ]
    }
  }
};

const outPath = path.join(__dirname, 'n8n-workflows', 'post-call-intelligence-pipeline.json');
fs.writeFileSync(outPath, JSON.stringify(workflow, null, 2));
console.log('Saved workflow JSON to:', outPath);

// Deploy/Update to n8n Cloud via REST API
const WORKFLOW_ID = 'xMLcBqAKsKtHR7fq';
const payload = JSON.stringify({
  name: workflow.name,
  nodes: workflow.nodes,
  connections: workflow.connections,
  settings: { executionOrder: "v1" }
});

const req = https.request({
  hostname: N8N_URL,
  port: 443,
  path: `/api/v1/workflows/${WORKFLOW_ID}`,
  method: 'PUT',
  headers: {
    'X-N8N-API-KEY': N8N_API_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(payload)
  }
}, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => {
    console.log('Update Status Code:', res.statusCode);
    if (res.statusCode >= 200 && res.statusCode < 300) {
      const resp = JSON.parse(body);
      console.log('Workflow Updated! ID:', resp.id, '| Active:', resp.active);
      if (!resp.active) activateWorkflow(resp.id);
    } else {
      console.error('Failed to update workflow:', body);
    }
  });
});

req.on('error', e => console.error('Req error:', e.message));
req.write(payload);
req.end();

function activateWorkflow(id) {
  const actReq = https.request({
    hostname: N8N_URL,
    port: 443,
    path: `/api/v1/workflows/${id}/activate`,
    method: 'POST',
    headers: {
      'X-N8N-API-KEY': N8N_API_KEY,
      'Content-Type': 'application/json'
    }
  }, (res) => {
    let body = '';
    res.on('data', c => body += c);
    res.on('end', () => {
      console.log('Activation Status:', res.statusCode, body);
    });
  });
  actReq.end();
}
