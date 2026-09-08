// Generate the bcrypt hash for the single admin password.
//
// Recommended (secure — prompts with hidden input, nothing hits shell history):
//   npm run admin:hash
//
// Or pass it inline (use SINGLE quotes so $ and ! aren't touched by the shell):
//   npm run admin:hash 'your-strong-password'
//
// Copy the printed ADMIN_PASSWORD_HASH line into .env.local (and Vercel).
// The plaintext is never stored — only this hash.

import { createInterface } from "node:readline";
import { stdin, stdout } from "node:process";
import bcrypt from "bcryptjs";

function promptHidden(query: string): Promise<string> {
  return new Promise((resolve) => {
    const rl = createInterface({ input: stdin, output: stdout, terminal: true });
    // Mask keystrokes: print the query, then swallow the echo of typed chars.
    const internal = rl as unknown as {
      stdoutMuted: boolean;
      output: NodeJS.WriteStream;
      _writeToOutput: (s: string) => void;
    };
    internal.stdoutMuted = false;
    internal._writeToOutput = (s: string) => {
      if (!internal.stdoutMuted) internal.output.write(s);
    };
    rl.question(query, (answer) => {
      rl.close();
      stdout.write("\n");
      resolve(answer);
    });
    internal.stdoutMuted = true; // mute everything after the prompt is shown
  });
}

async function main() {
  const password = process.argv[2] ?? (await promptHidden("Admin password: "));
  if (!password) {
    console.error("No password provided.");
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("Please use a password of at least 8 characters.");
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 12);
  // Base64-encode so the value has no `$` characters. Next.js expands `$` in
  // .env values as variable references, which would otherwise corrupt the hash.
  const encoded = Buffer.from(hash, "utf8").toString("base64");
  console.log("\nADMIN_PASSWORD_HASH=" + encoded + "\n");
}

main();
