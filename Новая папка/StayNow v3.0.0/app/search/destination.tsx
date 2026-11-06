import React from 'react';
import { useRouter } from 'expo-router';
import { Button, Input, ListRow, PlaceholderScreen } from '@/components/ui';
import { MapPin } from 'lucide-react-native';
import { colors } from '@/theme';
import { az } from '@/i18n/az';

export default function SearchDestinationScreen() {
  const router = useRouter();

  return (
    <PlaceholderScreen
      title={az.search.destinationTitle}
      subtitle="Şəhər, rayon və ya otel adı üzrə axtarış edin"
    >
      <Input
        label="İstiqamət və ya otel"
        placeholder="Məsələn: Nizami küçəsi, Bakı..."
        defaultValue="Bakı, Azərbaycan"
        leftIcon={<MapPin size={18} color={colors.primary} />}
      />

      <ListRow
        title="Bakı Mərkəzi"
        description="Fəvvarələr meydanı, Bulvar və İçərişəhər"
        icon={<MapPin size={20} color={colors.primary} />}
        onPress={() => router.push('/search/results')}
      />
      <ListRow
        title="Dənizkənarı Milli Park"
        description="Neftçilər prospekti boyu otellər"
        icon={<MapPin size={20} color={colors.primary} />}
        onPress={() => router.push('/search/results')}
      />

      <Button
        title="Axtarış nəticələrinə bax"
        variant="primary"
        style={{ marginTop: 24 }}
        onPress={() => router.push('/search/results')}
      />
    </PlaceholderScreen>
  );
}

