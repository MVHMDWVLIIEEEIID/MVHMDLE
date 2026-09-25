import React from "react";

export default function GameBoardLayout({
  leftPanel,
  board,
  rightPanel,
  keyboard,
  boardContainerClass = "w-96",
}) {
  return (
    <>
      <div className="flex-10 flex justify-center items-center gap-6 px-10 overflow-y-auto clean-scroll">
        {/* اللوحة اليسرى (مثل الـ Shop) - تظهر فقط إذا تم تمريرها */}
        {leftPanel && <div className="w-72 shrink-0">{leftPanel}</div>}

        {/* منطقة اللعب بالمنتصف (Tiles) */}
        <div className={`flex justify-center ${boardContainerClass}`}>
          {board}
        </div>

        {/* اللوحة اليمنى (مثل الـ History) - تظهر فقط إذا تم تمريرها */}
        {rightPanel && <div className="w-72 shrink-0">{rightPanel}</div>}
      </div>

      {/* منطقة الكيبورد السفلية */}
      <div className="flex-5 center shrink-0 mb-4">{keyboard}</div>
    </>
  );
}
