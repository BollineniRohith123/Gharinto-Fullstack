# Gharinto Platform - CRM Integration Architecture

## 🎯 Overview

This document outlines the comprehensive CRM integration architecture for the Gharinto Platform, featuring dual-CRM strategy with LeadPro CRM and Perfex CRM with LeadPilot AI for advanced voice automation.

## 🏗 CRM Architecture Strategy

### Dual-CRM Approach

#### Primary CRM: LeadPro CRM
- **Purpose**: Comprehensive lead management and call center functionality
- **Role**: System of record for all lead data
- **Features**: Multi-channel lead capture, advanced reporting, lead scoring
- **Integration**: Direct API integration with Gharinto dashboard

#### Secondary CRM: Perfex CRM + LeadPilot AI
- **Purpose**: Voice automation and AI-powered engagement
- **Role**: Voice interaction engine and automated call management
- **Features**: VoIP integration, call recording, transcription, sentiment analysis
- **Integration**: Twilio-powered voice services with AI processing

## 🔄 Data Flow Architecture

```
Lead Generation → LeadPro CRM (Primary) → Gharinto Admin Dashboard
                                    ↓
Lead Assignment → Designer/Admin Action → Perfex CRM (Voice)
                                    ↓
Call Initiation → Twilio VoIP → LeadPilot AI Processing
                                    ↓
Call Results → Perfex CRM → Sync to LeadPro → Update Gharinto
```

## 📊 System Integration Points

### 1. LeadPro CRM Integration

#### API Endpoints
```javascript
// Lead creation in LeadPro
POST /api/crm/leadpro/leads
{
  "source": "website",
  "customer_name": "John Doe",
  "email": "john@example.com",
  "phone": "+91-9876543210",
  "city": "Mumbai",
  "project_type": "Full Home Interior",
  "budget_range": "₹10-20 Lakhs",
  "description": "Modern apartment interior",
  "lead_score": 85,
  "assigned_to": "admin-id"
}

// Get lead details
GET /api/crm/leadpro/leads/:leadId

// Update lead status
PUT /api/crm/leadpro/leads/:leadId/status
{
  "status": "qualified",
  "notes": "Customer confirmed budget and timeline"
}
```

#### Data Synchronization
- **Real-time sync**: Webhook-based updates
- **Frequency**: Immediate for critical events, 5-minute intervals for status updates
- **Error handling**: Retry mechanism with exponential backoff

### 2. Perfex CRM + LeadPilot AI Integration

#### Voice Call Workflow
```javascript
// Initiate call through Perfex
POST /api/crm/perfex/calls/initiate
{
  "lead_id": "lead-123",
  "phone_number": "+91-9876543210",
  "caller_id": "admin-user-id",
  "call_type": "lead_followup",
  "script_template": "initial_contact"
}

// Call recording and transcription
POST /api/crm/perfex/calls/:callId/process
{
  "recording_url": "https://twilio-recordings.../",
  "duration": 180,
  "call_outcome": "interested",
  "next_action": "schedule_appointment"
}
```

#### AI-Powered Features
- **Real-time transcription**: Live call-to-text conversion
- **Sentiment analysis**: Customer mood and interest level detection
- **Conversation insights**: Key topics and concerns identification
- **Automated follow-up**: AI-suggested next steps and scheduling

## 🛠 Technical Implementation

### CRM Service Layer

```typescript
// server/services/crmService.ts
export class CRMService {
  private leadProClient: LeadProClient;
  private perfexClient: PerfexClient;
  private twilioClient: TwilioClient;

  async createLead(leadData: LeadData): Promise<Lead> {
    // Create in LeadPro first (source of truth)
    const leadProLead = await this.leadProClient.createLead(leadData);
    
    // Sync to Gharinto database
    const gharintoLead = await storage.createLead({
      externalId: leadProLead.id,
      projectId: leadData.projectId,
      status: 'new',
      score: leadProLead.score
    });

    return gharintoLead;
  }

  async initiateCall(leadId: string, callerId: string): Promise<CallSession> {
    // Get lead from LeadPro
    const lead = await this.leadProClient.getLead(leadId);
    
    // Initiate call through Perfex + Twilio
    const callSession = await this.perfexClient.initiateCall({
      leadId: lead.id,
      phoneNumber: lead.phone,
      callerId: callerId
    });

    // Create call record in Twilio
    const twilioCall = await this.twilioClient.createCall({
      to: lead.phone,
      from: process.env.TWILIO_PHONE_NUMBER,
      url: `${process.env.BASE_URL}/api/crm/twilio/voice-webhook`,
      record: true
    });

    return {
      callId: callSession.id,
      twilioSid: twilioCall.sid,
      status: 'initiated'
    };
  }

  async processCallResults(callId: string, results: CallResults): Promise<void> {
    // Process with LeadPilot AI
    const aiAnalysis = await this.leadPilotAI.analyzeCall({
      transcription: results.transcription,
      duration: results.duration,
      customerSentiment: results.sentiment
    });

    // Update Perfex CRM
    await this.perfexClient.updateCall(callId, {
      outcome: results.outcome,
      sentiment: aiAnalysis.sentiment,
      nextAction: aiAnalysis.suggestedAction,
      followUpDate: aiAnalysis.suggestedFollowUp
    });

    // Sync back to LeadPro
    await this.leadProClient.updateLead(results.leadId, {
      lastContactDate: new Date(),
      callOutcome: results.outcome,
      sentiment: aiAnalysis.sentiment,
      nextAction: aiAnalysis.suggestedAction
    });

    // Update Gharinto
    await storage.updateLeadStatus(results.leadId, results.outcome);
  }
}
```

### Webhook Handlers

```typescript
// server/routes/crmWebhooks.ts
app.post('/api/crm/leadpro/webhook', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'lead_updated':
      await syncLeadFromLeadPro(data.lead_id);
      break;
    case 'lead_assigned':
      await notifyDesigner(data.lead_id, data.assigned_to);
      break;
    case 'lead_status_changed':
      await updateGharintoLeadStatus(data.lead_id, data.new_status);
      break;
  }
  
  res.status(200).json({ received: true });
});

app.post('/api/crm/perfex/webhook', async (req, res) => {
  const { event, data } = req.body;
  
  switch (event) {
    case 'call_completed':
      await processCallCompletion(data.call_id);
      break;
    case 'call_transcribed':
      await processCallTranscription(data.call_id, data.transcription);
      break;
    case 'ai_analysis_complete':
      await syncAIInsights(data.call_id, data.analysis);
      break;
  }
  
  res.status(200).json({ received: true });
});
```

## 📞 Twilio VoIP Integration

### Call Flow Architecture

```typescript
// Twilio Voice Webhook Handler
app.post('/api/crm/twilio/voice-webhook', (req, res) => {
  const twiml = new VoiceResponse();
  
  // Record the call
  twiml.record({
    transcribe: true,
    transcribeCallback: '/api/crm/twilio/transcription-webhook',
    maxLength: 1800, // 30 minutes max
    playBeep: false
  });
  
  // Connect to agent
  twiml.dial({
    callerId: process.env.TWILIO_PHONE_NUMBER,
    record: 'record-from-answer-dual'
  }, process.env.AGENT_PHONE_NUMBER);
  
  res.type('text/xml');
  res.send(twiml.toString());
});

// Transcription Webhook
app.post('/api/crm/twilio/transcription-webhook', async (req, res) => {
  const {
    CallSid,
    TranscriptionText,
    TranscriptionStatus,
    RecordingUrl
  } = req.body;
  
  if (TranscriptionStatus === 'completed') {
    // Send to LeadPilot AI for analysis
    await crmService.processCallTranscription({
      callSid: CallSid,
      transcription: TranscriptionText,
      recordingUrl: RecordingUrl
    });
  }
  
  res.status(200).end();
});
```

### Click-to-Call Implementation

```typescript
// Frontend click-to-call component
const ClickToCallButton = ({ leadId, phoneNumber }) => {
  const initiateCall = async () => {
    try {
      const response = await apiRequest('POST', '/api/crm/calls/initiate', {
        leadId,
        phoneNumber
      });
      
      // Show call status in UI
      setCallStatus('connecting');
      
      // Monitor call progress
      pollCallStatus(response.callId);
    } catch (error) {
      toast.error('Failed to initiate call');
    }
  };

  return (
    <Button onClick={initiateCall} className="flex items-center">
      <Phone className="w-4 h-4 mr-2" />
      Call {phoneNumber}
    </Button>
  );
};
```

## 🤖 LeadPilot AI Integration

### AI Analysis Pipeline

```typescript
class LeadPilotAI {
  async analyzeCall(callData: CallData): Promise<AIAnalysis> {
    // Sentiment analysis
    const sentiment = await this.analyzeSentiment(callData.transcription);
    
    // Extract key information
    const keyInfo = await this.extractKeyInformation(callData.transcription);
    
    // Generate insights
    const insights = await this.generateInsights({
      sentiment,
      keyInfo,
      duration: callData.duration,
      customerProfile: callData.customerProfile
    });
    
    // Suggest next actions
    const nextActions = await this.suggestNextActions(insights);
    
    return {
      sentiment,
      keyTopics: keyInfo.topics,
      concerns: keyInfo.concerns,
      interests: keyInfo.interests,
      suggestedAction: nextActions.primary,
      suggestedFollowUp: nextActions.followUpDate,
      confidence: insights.confidence,
      leadQuality: insights.leadQuality
    };
  }

  private async analyzeSentiment(transcription: string): Promise<Sentiment> {
    // AI model for sentiment analysis
    const response = await this.aiClient.analyze({
      text: transcription,
      model: 'sentiment-v2',
      language: 'en'
    });
    
    return {
      overall: response.sentiment, // positive, negative, neutral
      confidence: response.confidence,
      emotions: response.emotions // excited, frustrated, interested, etc.
    };
  }
}
```

## 📈 Analytics and Reporting

### CRM Performance Metrics

```typescript
// Analytics service for CRM metrics
class CRMAnalyticsService {
  async getCallCenterMetrics(dateRange: DateRange): Promise<CallMetrics> {
    return {
      totalCalls: await this.getTotalCalls(dateRange),
      averageCallDuration: await this.getAverageCallDuration(dateRange),
      conversionRate: await this.getConversionRate(dateRange),
      sentimentBreakdown: await this.getSentimentBreakdown(dateRange),
      agentPerformance: await this.getAgentPerformance(dateRange),
      leadQualityScores: await this.getLeadQualityScores(dateRange)
    };
  }

  async getLeadPerformance(dateRange: DateRange): Promise<LeadMetrics> {
    return {
      leadsGenerated: await this.getLeadsGenerated(dateRange),
      leadsQualified: await this.getLeadsQualified(dateRange),
      leadsConverted: await this.getLeadsConverted(dateRange),
      averageResponseTime: await this.getAverageResponseTime(dateRange),
      sourceBreakdown: await this.getSourceBreakdown(dateRange),
      cityWisePerformance: await this.getCityWisePerformance(dateRange)
    };
  }
}
```

### Unified Dashboard Integration

```typescript
// Admin dashboard CRM component
const CRMDashboard = () => {
  const { data: crmMetrics } = useQuery({
    queryKey: ['/api/analytics/crm-metrics'],
  });
  
  const { data: callMetrics } = useQuery({
    queryKey: ['/api/analytics/call-metrics'],
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Lead Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Leads Generated Today:</span>
              <span className="font-bold">{crmMetrics?.leadsToday}</span>
            </div>
            <div className="flex justify-between">
              <span>Conversion Rate:</span>
              <span className="font-bold">{crmMetrics?.conversionRate}%</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Response Time:</span>
              <span className="font-bold">{crmMetrics?.avgResponseTime}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Call Center Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Calls Made Today:</span>
              <span className="font-bold">{callMetrics?.callsToday}</span>
            </div>
            <div className="flex justify-between">
              <span>Avg Call Duration:</span>
              <span className="font-bold">{callMetrics?.avgDuration}m</span>
            </div>
            <div className="flex justify-between">
              <span>Positive Sentiment:</span>
              <span className="font-bold">{callMetrics?.positiveSentiment}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
```

## 🔐 Security and Compliance

### Data Protection
- **Encryption**: All call recordings and transcriptions encrypted at rest
- **Access Control**: Role-based access to sensitive CRM data
- **Audit Logs**: Complete audit trail of all CRM interactions
- **Data Retention**: Configurable retention policies for call data

### Compliance Features
- **GDPR Compliance**: Data deletion and export capabilities
- **Call Recording Consent**: Automated consent management
- **Data Anonymization**: PII masking in analytics and reports

## 🚀 Deployment and Scaling

### Infrastructure Requirements
- **VoIP Capacity**: Concurrent call handling for 50+ users
- **Storage**: High-performance storage for call recordings
- **Processing**: GPU-enabled instances for AI analysis
- **Bandwidth**: High-bandwidth network for voice quality

### Monitoring and Alerting
- **Call Quality Monitoring**: Real-time audio quality metrics
- **System Health**: CRM integration health checks
- **Performance Alerts**: Response time and error rate monitoring

This CRM architecture provides a comprehensive, scalable solution for lead management and voice automation that integrates seamlessly with the Gharinto Platform while maintaining data consistency and providing powerful AI-driven insights.