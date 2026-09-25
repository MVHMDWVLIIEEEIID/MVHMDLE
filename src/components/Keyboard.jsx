export default function Keyboard({
  letters,
  lastChanged,
  lineColorsByLetter = {},
  bossWordCount = 0,
  selectedView = "all",
  onSelectedViewChange,
}) {
  if (!letters || typeof letters !== "object") return null;

  const pressKey = (letter) => {
    const key =
      letter === "enter" ? "Backspace" : letter === "back" ? "Enter" : letter;
    window.dispatchEvent(
      new KeyboardEvent("keydown", { key, bubbles: true, cancelable: true }),
    );
  };

  let lettersRow1 = [];
  let lettersRow2 = [];
  let lettersRow3 = [];

  Object.keys(letters).forEach((letter) => {
    const keyData = letters[letter];
    const color = keyData.color;

    // --- Animation Logic ---
    const isTarget = lastChanged?.letter === letter;
    const uniqueKey = isTarget ? `${letter}-${lastChanged.timestamp}` : letter;
    const animationClass = isTarget ? "animate-pop" : "";

    // Base classes for Tailwind styling
    const baseStyle = `center rounded m-0.5 text-gameDark uppercase transition-all duration-500 ease-in-out active:scale-95 ${color} ${animationClass}`;

    // --- Boss Mode Logic (Lines & Multiple Colors) ---
    const lines = lineColorsByLetter[letter] || [];
    const showLines = lines.length > 0 && /^[a-z]$/i.test(letter);

    // محتوى الزر
    const keyContent = (
      <>
        {showLines && (
          <div className="absolute inset-0 flex overflow-hidden rounded">
            {lines.map((lineColor, idx) => (
              <div
                key={`${letter}-line-${idx}`}
                // [FIX] إزالة الـ Fallback للاعتماد على اللون الدقيق لكل قسم فقط
                className={`flex-1 h-full ${lineColor} ${idx < lines.length - 1 ? "border-r border-black/25" : ""}`}
              />
            ))}
          </div>
        )}
        <span className="relative z-10 text-2xl font-bold leading-none">
          {letter === "enter" ? "Back" : letter === "back" ? "Enter" : letter}
        </span>
      </>
    );

    const buttonProps = {
      type: "button",
      "aria-label":
        letter === "enter" ? "Backspace" : letter === "back" ? "Enter" : letter,
      onMouseDown: (event) => event.preventDefault(),
      onClick: () => pressKey(letter),
    };

    // --- Row Distribution ---
    if (keyData.row === 1 || keyData.row === 2) {
      const rowArr = keyData.row === 1 ? lettersRow1 : lettersRow2;
      rowArr.push(
        <button
          key={uniqueKey}
          {...buttonProps}
          className={`${baseStyle} aspect-square w-14 relative overflow-hidden flex items-center justify-center`}
        >
          {keyContent}
        </button>,
      );
    } else if (keyData.row === 3) {
      lettersRow3.push(
        <button
          key={uniqueKey}
          {...buttonProps}
          className={`${baseStyle} h-14 ${keyData.big ? "flex-1.5 px-4" : "flex-1"} relative overflow-hidden flex items-center justify-center`}
        >
          {keyContent}
        </button>,
      );
    }
  });

  // --- Boss Selector Logic ---
  const getViewLabel = (index) => {
    if (index === 0) return "1ST";
    if (index === 1) return "2ND";
    if (index === 2) return "3RD";
    return `${index + 1}TH`;
  };

  const selectorItems = Array.from({ length: bossWordCount }, (_, idx) => ({
    key: idx,
    label: getViewLabel(idx),
    value: idx,
  }));

  if (bossWordCount > 1) {
    selectorItems.push({ key: "all", label: "ALL", value: "all" });
  }

  return (
    <div className="flex flex-col items-center">
      <div className="flex">{lettersRow1}</div>
      <div className="flex justify-center">{lettersRow2}</div>
      <div className="flex w-full justify-center">{lettersRow3}</div>

      {bossWordCount > 1 && typeof onSelectedViewChange === "function" && (
        <div className="mt-2 flex items-center justify-center rounded-md border border-gameLight/25 bg-black/30 p-1">
          {selectorItems.map((item) => {
            const isActive = selectedView === item.value;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onSelectedViewChange(item.value)}
                className={`mx-0.5 min-w-12 rounded px-2 py-1 text-[10px] font-black uppercase tracking-wide transition-all ${
                  isActive
                    ? "bg-gameGreen text-gameDark"
                    : "bg-gameLight/20 text-gameLight hover:bg-gameLight/30"
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
