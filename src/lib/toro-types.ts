export type RiskLevel = "Low" | "Medium" | "High" | "Critical";
export type ApprovalRequirement = "None" | "Human review" | "Owner approval" | "Blocked";
export type OperationalStatus = "Active" | "Review" | "Queued" | "Draft" | "Blocked" | "Ready" | "Not connected";
export type ActionLevel = "observe" | "analyze" | "draft" | "recommend" | "prepare_fields" | "queue_task" | "execute_low_risk" | "execute_with_approval" | "blocked";

export type SourceMeta = {
  source: string;
  status: OperationalStatus;
  risk: RiskLevel;
  confidence: number;
  approval: ApprovalRequirement;
  nextAction: string;
};

export type AirtableFieldType = "singleLineText" | "multilineText" | "singleSelect" | "multipleSelects" | "number" | "checkbox" | "url" | "date" | "email" | "phoneNumber" | "formula";

export type AirtableTableModel = {
  id: string;
  name: string;
  authorityRole: string;
  module: string;
  fields: { id: string; name: string; type: AirtableFieldType | string }[];
};

export type OperatingModule = SourceMeta & {
  id: string;
  name: string;
  purpose: string;
  primaryObjects: string[];
  queuedActions: string[];
  actionLevel: ActionLevel;
};

export type Connector = SourceMeta & {
  id: string;
  name: string;
  category: string;
  mode: string;
  authority: string;
  currentCapability: string;
  futureConnectorNeed: string;
  allowedActions: ActionLevel[];
};

export type QueuedAction = SourceMeta & {
  id: string;
  title: string;
  module: string;
  targetTool: string;
  actionLevel: ActionLevel;
  impact: string;
  log: string[];
};

export type BusinessObject = SourceMeta & {
  id: string;
  type: "Workspace" | "Property" | "Villa" | "Room" | "Asset" | "Operation" | "Rule" | "Content";
  name: string;
  owner: string;
  details: string;
};

export type AgentProfile = SourceMeta & {
  id: string;
  name: string;
  role: string;
  memoryScope: string;
  dataAccess: string[];
  toolAccess: string[];
  allowedActions: ActionLevel[];
  blockedActions: string[];
};

export type ApprovalState = "Pending" | "Approved" | "Rejected" | "Needs changes";

export type ApprovalRecord = SourceMeta & {
  id: string;
  title: string;
  module: string;
  targetTool: string;
  requestedBy: string;
  state: ApprovalState;
  actionLevel: ActionLevel;
  updatedAt: string;
};

export type AuditEvent = SourceMeta & {
  id: string;
  event: string;
  actor: string;
  target: string;
  timestamp: string;
  outcome: "prepared" | "approved" | "rejected" | "blocked" | "observed";
};

export type WorkspaceRole = {
  id: string;
  workspace: string;
  role: string;
  permissions: string[];
  blocked: string[];
  approvalLimit: ApprovalRequirement;
  source: string;
};

export type ConnectorEndpoint = SourceMeta & {
  id: string;
  name: string;
  route: string;
  method: "GET" | "POST";
  mode: "read_only" | "prepare_only" | "blocked";
  envRequired: string[];
  externalWrite: false;
};
