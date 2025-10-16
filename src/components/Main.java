import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws Exception {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        int t = Integer.parseInt(br.readLine().trim());
        StringBuilder out = new StringBuilder();
        while (t-- > 0) {
            String line = br.readLine();
            while (line != null && line.trim().isEmpty()) line = br.readLine();
            String[] p = line.trim().split("\\s+");
            int n = Integer.parseInt(p[0]);
            int m = Integer.parseInt(p[1]);
            int k = Integer.parseInt(p[2]);
            String a = br.readLine().trim();
            out.append(canPass(a, n, m, k) ? "YES\n" : "NO\n");
        }
        System.out.print(out.toString());
    }

    // a: length n, positions 1..n are a.charAt(0..n-1)
    // return true if can reach n+1
    static boolean canPass(String a, int n, int m, int k) {
        int N = n + 2; // positions 0..n+1
        final int INF = Integer.MAX_VALUE / 4;
        int[] best = new int[N]; // best[pos] = minimal swimUsed to reach pos
        Arrays.fill(best, INF);

        ArrayDeque<int[]> q = new ArrayDeque<>();
        best[0] = 0;
        q.add(new int[]{0, 0}); // {pos, swimUsed}

        while (!q.isEmpty()) {
            int[] cur = q.poll();
            int pos = cur[0];
            int swim = cur[1];

            if (pos == n + 1) return true; // reached exit

            // 判断当前是否在水中
            boolean inWater = (pos >= 1 && pos <= n && a.charAt(pos - 1) == 'W');

            if (inWater) {
                // 在水中只能游到下一个位置
                int next = pos + 1;
                int ns = swim + 1;
                if (ns > k) continue; // 超过体力
                if (next == n + 1) return true; // 游到终点（n+1为陆地）
                char ch = a.charAt(next - 1);
                if (ch == 'C') continue; // 触沼泽失败
                if (ns < best[next]) {
                    best[next] = ns;
                    q.add(new int[]{next, ns});
                }
            } else {
                // 在陆地上：尝试跳 1..m
                for (int jump = 1; jump <= m; jump++) {
                    int np = pos + jump;
                    if (np > n + 1) break;
                    if (np == n + 1) return true; // 直接跳到终点
                    char ch = a.charAt(np - 1);
                    if (ch == 'C') continue; // 不能落在沼泽
                    // 落在L或W都允许，此时已用游泳量不变
                    if (swim < best[np]) {
                        best[np] = swim;
                        q.add(new int[]{np, swim});
                    }
                }
            }
        }
        return false;
    }
}
