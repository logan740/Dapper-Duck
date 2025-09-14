'use client';

interface StartGameScreenProps {
  onStartGame: () => void;
  onCancel: () => void;
}

export function StartGameScreen({ onStartGame, onCancel }: StartGameScreenProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
        <div className="mb-6">
          <div className="text-6xl mb-4">🎮</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Transaction Confirmed!
          </h2>
          <p className="text-gray-600">
            Your 0.001 ETH payment has been processed successfully.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={onStartGame}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            🚀 Start Premium Game
          </button>
          
          <button
            onClick={onCancel}
            className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
        
        <p className="text-sm text-gray-500 mt-4">
          Ready to play your premium game?
        </p>
      </div>
    </div>
  );
}
