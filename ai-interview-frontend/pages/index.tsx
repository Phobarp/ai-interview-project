import Image from "next/image";
import Button from "../components/button";

export default function Home() {
  return (
    <div className="flex flex-col w-screen h-screen items-center justify-around py-[6vh]">
      <Image src="/robot.svg" width={300} height={300} alt="Robot" />
      <div className="font-inter text-7xl font-bold text-center leading-[6rem]">
        Portray yourself with confidence <br />
        <span className="text-[#A3A3A3]">with AI by your side</span>
      </div>
      <Button href="/interview">Start Interview</Button>
    </div>
  );
}
