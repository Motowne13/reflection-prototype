import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, Share2 } from 'lucide-react';

interface InsightCaptureProps {
  insight: string;
  visible: boolean;
}

export default function InsightCapture({ insight, visible }: InsightCaptureProps) {
    console.log('InsightCapture received:', { insight, visible });
  
    if (!visible || !insight) {
      console.log('InsightCapture returning null because:', { visible, hasInsight: !!insight });
      return null;
    }
  

  // Remove "It seems" and the question
  const cleanedInsight = insight
    .replace(/^It seems /i, '')
    .replace(/\s*\(?Does this feel true to you\)?\??/i, '')
    .replace(/\s*Please respond with yes or no\.?/i, '');

  const handleSave = () => {
    const element = document.createElement("a");
    const file = new Blob([cleanedInsight], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = "my-impact-insight.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My Impact Insight',
        text: cleanedInsight,
      }).catch(console.error);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-blue-50 mt-4">
      <CardHeader>
        <CardTitle className="text-lg font-medium text-purple-800">Your Impact Insight</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-gray-800 mb-4 text-lg">{cleanedInsight}</p>
        <div className="flex space-x-2">
          <Button 
            onClick={handleSave}
            className="flex items-center space-x-2 bg-purple-600 hover:bg-purple-700"
          >
            <Download className="w-4 h-4" />
            <span>Save</span>
          </Button>
          <Button 
            onClick={handleShare}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}