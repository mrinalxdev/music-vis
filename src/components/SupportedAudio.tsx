import { Info } from "lucide-react";

const SupportedAudio = () => {
    return ( 
        <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <h2 className="flex items-center text-lg font-semibold text-blue-700 mb-2">
                <Info className="mr-2" />
                Supported Audio Formats
            </h2>
            <ul className="list-disc list-inside text-blue-600">
                <li>MP3 (.mp3)</li>
                <li>MPEG (.mpeg)</li>
                <li>WAV (.wav)</li>
            </ul>
        </div>
     );
}
 
export default SupportedAudio;