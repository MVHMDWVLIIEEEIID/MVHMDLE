import { useNavigate } from "react-router";
import Header from "../components/Header";
import Keyboard from "../components/Keyboard";
import Wordle500Board from "../components/Wordle500Board";
import useWordle500Game from "../hooks/useWordle500Game";

const keyboardLayout = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["enter", "z", "x", "c", "v", "b", "n", "m", "back"],
];

const makeLetters = (game) =>
  Object.fromEntries(
    keyboardLayout
      .flat()
      .map((letter) => [
        letter,
        {
          color: game.isTyped(letter) ? "bg-gameLight/30" : "bg-gameLight",
          row: keyboardLayout.findIndex((row) => row.includes(letter)) + 1,
          big: letter === "enter" || letter === "back",
        },
      ]),
  );

export default function Wordle500() {
  const navigate = useNavigate();
  const game = useWordle500Game();
  const letters = makeLetters(game);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gameDark text-white">
      <div className="flex-1 center flex-col">
        <Header mode="WORDLE500 BOSS" onModeClick={() => navigate("/")} />
      </div>
      <main className="flex-10 flex flex-col items-center justify-center gap-5 overflow-y-auto px-5 clean-scroll">
        <Wordle500Board game={game} />
        {game.gameState !== "playing" && (
          <div className="flex items-center gap-4 text-sm font-black uppercase tracking-widest">
            <span
              className={
                game.gameState === "won" ? "text-gameGreen" : "text-gameRed"
              }
            >
              {game.gameState === "won"
                ? "Boss defeated"
                : `Boss was ${game.targetWord}`}
            </span>
            <button
              type="button"
              onClick={game.reset}
              className="rounded border border-gameLight/40 px-3 py-1 hover:bg-gameLight hover:text-gameDark"
            >
              New boss
            </button>
          </div>
        )}
      </main>
      <div className="flex-5 center shrink-0 mb-4">
        <Keyboard letters={letters} lastChanged={null} />
      </div>
    </div>
  );
}
