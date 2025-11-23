'use client';

import {
  BarVisualizer,
  type TrackReferenceOrPlaceholder,
  useTrackToggle,
} from '@livekit/components-react';
import { TrackDeviceSelect } from '@/components/livekit/agent-control-bar/track-device-select';
import { TrackToggle } from '@/components/livekit/agent-control-bar/track-toggle';
import { cn } from '@/lib/utils';

interface TrackSelectorProps {
  kind: MediaDeviceKind;
  source: Parameters<typeof useTrackToggle>[0]['source'];
  pressed?: boolean;
  pending?: boolean;
  disabled?: boolean;
  className?: string;
  audioTrackRef?: TrackReferenceOrPlaceholder;
  onPressedChange?: (pressed: boolean) => void;
  onMediaDeviceError?: (error: Error) => void;
  onActiveDeviceChange?: (deviceId: string) => void;
}

export function TrackSelector({
  kind,
  source,
  pressed,
  pending,
  disabled,
  className,
  audioTrackRef,
  onPressedChange,
  onMediaDeviceError,
  onActiveDeviceChange,
}: TrackSelectorProps) {
  return (
    <div className={cn('flex items-center bg-muted/30 rounded-xl overflow-hidden border border-border/50 hover:border-border transition-all duration-200', className)}>
      <TrackToggle
        size="icon"
        variant="default"
        source={source}
        pressed={pressed}
        pending={pending}
        disabled={disabled}
        onPressedChange={onPressedChange}
        className={cn(
          "relative h-10 w-10 rounded-none first:rounded-l-xl last:rounded-r-xl",
          "hover:bg-primary/10 transition-colors duration-200",
          "peer/track group/track has-[.audiovisualizer]:w-auto has-[.audiovisualizer]:px-3",
          pressed && "bg-primary/10 hover:bg-primary/20"
        )}
      >
        {audioTrackRef && (
          <BarVisualizer
            barCount={3}
            options={{ minHeight: 6, maxHeight: 16 }}
            trackRef={audioTrackRef}
            className="audiovisualizer flex h-6 w-auto items-center justify-center gap-0.5"
          >
            <span
              className={cn([
                'h-full w-0.5 origin-center rounded-full',
                'transition-colors duration-200',
                'group-data-[state=on]/track:bg-primary group-data-[state=off]/track:bg-muted-foreground/50',
                'data-lk-muted:bg-muted',
              ])}
            />
          </BarVisualizer>
        )}
      </TrackToggle>
      
      <div className={cn(
        "w-px h-6 bg-border/50 mx-1",
        "peer-data-[state=off]/track:bg-destructive/30"
      )} />
      
      <TrackDeviceSelect
        size="sm"
        kind={kind}
        requestPermissions={false}
        onMediaDeviceError={onMediaDeviceError}
        onActiveDeviceChange={onActiveDeviceChange}
        className={cn([
          'rounded-none pl-3 pr-4 border-0 bg-transparent h-10',
          'text-muted-foreground hover:text-foreground focus:text-foreground',
          'hover:bg-accent/50 focus:bg-accent/50',
          'transition-all duration-200',
          'peer-data-[state=off]/track:text-muted-foreground',
          'peer-data-[state=off]/track:hover:text-foreground',
        ])}
      />
    </div>
  );
}
