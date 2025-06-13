const suspiciousPatterns = [
  /\bUNION\b/i,
  /\bOR\s+1\s*=\s*1\b/i,
  /\bDROP\s+TABLE\b/i,
  /\bDELETE\s+FROM\b/i,
  /\bINSERT\s+INTO\b/i,
  /--/,
  /\/\*/,
  /;\s*$/,
];

const querySql = "select 1 id union all select 2 id";

for (const pattern of suspiciousPatterns) {
  if (pattern.test(querySql)) {
    console.log("pattern-->", pattern);
    throw new Error(`SQL包含可疑模式，可能存在注入风险`);
  }
}
