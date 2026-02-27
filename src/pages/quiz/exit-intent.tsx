import type { GetServerSideProps, NextPage } from 'next';

// Ця сторінка більше не показує контент, а просто перенаправляє назад на план
const ExitIntent: NextPage = () => null;

export default ExitIntent;

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    redirect: {
      destination: '/quiz/plan-ready#pricing-section',
      permanent: false,
    },
  };
};

