export function Logo({ className = "" }: { className?: string }) {
  return (
    <a href="#top" className={`flex items-center gap-3 ${className}`} aria-label="Эко-Щит Каспия — на главную">
      <img src="/images/emblem.png" alt="" width={38} height={52} className="h-[52px] w-auto" />
      <span className="text-[15px] font-bold leading-tight text-white">
        Эко-Щит
        <br />
        Каспия
      </span>
    </a>
  );
}
