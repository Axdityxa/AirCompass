import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { ComponentProps, ReactNode } from 'react';
import { Platform, Pressable, Text } from 'react-native';

type Props = {
  href: string;
  children: ReactNode;
  style?: any;
  [key: string]: any;
};

export function ExternalLink({ href, children, style, ...rest }: Props) {
  if (Platform.OS === 'web') {
    return (
      <Link
        target="_blank"
        href={href as any}
        style={style}
        {...rest}
      >
        {children}
      </Link>
    );
  }
  
  return (
    <Pressable
      onPress={() => openBrowserAsync(href)}
      {...rest}
    >
      <Text style={style}>{children}</Text>
    </Pressable>
  );
}
