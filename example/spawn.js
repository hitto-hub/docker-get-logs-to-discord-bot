const { spawn } = require("child_process");

// 'ls'コマンドを引数'-la'付きで実行する
const ls = spawn("ls", ["-la"]);

// 標準出力のデータを取得
ls.stdout.on("data", (data) => {
  console.log(`stdout: \n${data}`);
});

// 標準エラー出力のデータを取得
ls.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

// プロセスが終了したときに実行される
ls.on("close", (code) => {
  console.log(`child process exited with code ${code}`);
});
